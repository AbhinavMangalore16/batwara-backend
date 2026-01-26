import { neo4JSettlementService } from '../domain/balance-neo4j.service';
import { SettlementOptimizer } from '../domain/settlement.service';
import { graph } from '../../../shared/infra/db/neo4j/neo4j-client.config';
import { randomUUID } from 'crypto';

interface billObject {
    description: string;
    totalAmount: number;
    splitType: 'equal' | 'exact' | 'percent';
    splitData: Array<{
        userId: string;
        splitAmount: number;
    }>;
}

interface returnObject {
    transactionId: string;
}

export class ExpenseNeo4jRepository {
    private balanceService = new neo4JSettlementService();
    private optimizer = new SettlementOptimizer();

    /**
     * Validate that all participants are friends with the bill creator
     */
    async validAllFriends(
        creatorId: string,
        participantIds: string[]
    ): Promise<boolean> {
        const driver = graph();

        try {
            const result = await driver.executeQuery(
                `
                MATCH (creator:Person {id: $creator})
                RETURN ALL(pid IN $participantIds
                    WHERE EXISTS {
                        MATCH (creator)-[:FRIENDS_WITH]-(:Person {id: pid})
                    }
                ) AS allFriends
                `,
                { creator: creatorId, participantIds }
            );

            const record = result.records?.[0];
            if (!record) return false;

            const allFriends = record.get("allFriends");

            // Runtime safety check
            return typeof allFriends === "boolean" ? allFriends : false;

        } catch (error) {
            console.error('[Neo4j] Friend validation error:', error);
            throw error;
        }
    }

    /**
     * Create a bill with splits in Neo4j and trigger settlement recomputation
     * Neo4j-First: Bills are source of truth in Neo4j
     */
    async splitThat(userId: string, billObject: billObject): Promise<returnObject> {
        const driver = graph();

        try {
            // Step 1: Validate friendship
            const friendsValid = await this.validAllFriends(
                userId,
                billObject.splitData.map(s => s.userId)
            );
            if (!friendsValid) {
                throw new Error('Not all participants are friends');
            }

            // Step 2: Create bill in Neo4j (immutable fact)
            const billId = randomUUID();
            
            await driver.executeQuery(
                `CREATE (b:Bill {
                    id: $billId,
                    description: $description,
                    totalAmount: $totalAmount,
                    splitType: $splitType,
                    owner_id: $owner,
                    createdAt: datetime()
                })
                RETURN b.id as id`,
                {
                    billId,
                    description: billObject.description,
                    totalAmount: billObject.totalAmount,
                    splitType: billObject.splitType,
                    owner: userId,
                }
            );

            // Step 3: Link payer to bill with CREATED relationship
            await driver.executeQuery(
                `MATCH (p:Person {id: $userId}), (b:Bill {id: $billId})
                 CREATE (p)-[:CREATED]->(b)`,
                { userId, billId }
            );

            // Step 4: Create split relationships (who participated and owes how much)
            for (const split of billObject.splitData) {
                await driver.executeQuery(
                    `MATCH (p:Person {id: $participantId}), (b:Bill {id: $billId})
                     CREATE (p)-[:PARTICIPATES_IN {amount: $amount}]->(b)`,
                    {
                        participantId: split.userId,
                        billId,
                        amount: split.splitAmount,
                    }
                );
            }

            // Step 5: Trigger settlement recomputation
            await this.recomputeSettlements();

            return { transactionId: billId };
        } catch (error) {
            console.error('[Neo4j] Bill creation failed:', error);
            throw error;
        }
    }

    /**
     * Recompute all settlements from Neo4j graph
     * 1. Clear old SETTLEMENT edges
     * 2. Calculate balances from CREATED/PARTICIPATES_IN relationships
     * 3. Optimize using heap algorithm
     * 4. Create new SETTLEMENT edges
     */
    async recomputeSettlements(): Promise<void> {
        try {
            // Compute balances from Neo4j graph
            const balances = await this.balanceService.computeBalances();
            
            if (!balances || Object.keys(balances).length === 0) {
                console.log('[Neo4j] No balances to settle');
                return;
            }

            // Optimize settlements using heap algorithm
            const settlements = this.optimizer.optimizeSettlements(balances);
            
            // Destructively recompute: clear old → insert new
            await this.clearSettlements();
            await this.createSettlement(settlements);

            console.log(`[Neo4j] Settlements recomputed: ${settlements.length} transactions`);
        } catch (error) {
            console.error('[Neo4j] Settlement recomputation failed:', error);
            throw error;
        }
    }

    /**
     * Create SETTLEMENT edges in Neo4j
     * Each settlement represents a direct payment obligation
     */
    async createSettlement(
        settlements: Array<{
            from: string;
            to: string;
            amount: number;
        }>
    ): Promise<void> {
        const driver = graph();

        try {
            for (const settlement of settlements) {
                await driver.executeQuery(
                    `MATCH (from:Person {id: $from}), (to:Person {id: $to})
                     CREATE (from)-[:SETTLEMENT {
                        amount: $amount,
                        createdAt: datetime(),
                        status: 'pending'
                     }]->(to)`,
                    {
                        from: settlement.from,
                        to: settlement.to,
                        amount: settlement.amount,
                    }
                );
            }
            console.log(`[Neo4j] Created ${settlements.length} settlement edges`);
        } catch (error) {
            console.error('[Neo4j] Settlement creation failed:', error);
            throw error;
        }
    }

    /**
     * Clear all SETTLEMENT edges (soft delete for recomputation)
     * Mark them as deleted with a timestamp instead of hard delete
     */
    async clearSettlements(): Promise<void> {
        const driver = graph();

        try {
            await driver.executeQuery(
                `MATCH ()-[s:SETTLEMENT]->()
                 SET s.status = 'deleted', s.deletedAt = datetime()`,
                {}
            );
            console.log('[Neo4j] Cleared old settlement edges');
        } catch (error) {
            console.error('[Neo4j] Settlement clearing failed:', error);
            throw error;
        }
    }

    /**
     * Get all active settlements for a user
     */
    async getUserSettlements(userId: string): Promise<
        Array<{
            from: string;
            to: string;
            amount: number;
            status: string;
        }>
    > {
        const driver = graph();

        try {
            const result = await driver.executeQuery(
                `MATCH (from:Person)-[s:SETTLEMENT {status: 'pending'}]->(to:Person)
                 WHERE from.id = $userId OR to.id = $userId
                 RETURN {
                    from: from.id,
                    to: to.id,
                    amount: s.amount,
                    status: s.status
                 } as settlement`,
                { userId }
            );

            return result.records.map(record => record.get('settlement'));
        } catch (error) {
            console.error('[Neo4j] Failed to fetch user settlements:', error);
            throw error;
        }
    }

    /**
     * Get all active settlements across all users
     */
    async getAllSettlements(): Promise<
        Array<{
            from: string;
            to: string;
            amount: number;
            status: string;
        }>
    > {
        const driver = graph();

        try {
            const result = await driver.executeQuery(
                `MATCH (from:Person)-[s:SETTLEMENT {status: 'pending'}]->(to:Person)
                 RETURN {
                    from: from.id,
                    to: to.id,
                    amount: s.amount,
                    status: s.status
                 } as settlement`,
                {}
            );

            return result.records.map(record => record.get('settlement'));
        } catch (error) {
            console.error('[Neo4j] Failed to fetch all settlements:', error);
            throw error;
        }
    }
}
