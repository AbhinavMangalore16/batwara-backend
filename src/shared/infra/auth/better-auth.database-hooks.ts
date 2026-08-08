import type { BetterAuthOptions } from "better-auth";
import { graph } from "../db/neo4j/neo4j-client.config";

export const databaseHooks:BetterAuthOptions["databaseHooks"] = {
		user: {
			create: {
				after: async (user) => {
					try {
						const driver = graph();
						console.log(user,"my user");
						let { records, summary } = await driver.executeQuery(`
							CREATE (p:Person {id: $userId,balance: $balance})`,
							{ 
								userId:user.id,
								balance:0
							}
						);
						console.log(
						`The query \`${summary.query.text}\` ` +
						`returned ${records.length} nodes.\n`
						);
					} catch (err) {
						console.error("Neo4j hook error (create user):", err);
					}
				}
			},
			delete: {
				after: async (user) => {
					try {
						const driver = graph();
						let { records, summary } = await driver.executeQuery(`
							MATCH (p:Person WHERE p.id = $userId)
	  						DETACH DELETE p`,
							{ userId : user.id}
						);
						console.log(
						`The query \`${summary.query.text}\` ` +
						`returned ${records.length} nodes.\n`
						);
					} catch (err) {
						console.error("Neo4j hook error (delete user):", err);
					}
				}
			}
		},
		session: {
			// Session hooks
		},
		account: {
			// Account hooks
		},
		verification: {
			// Verification hooks
		}
}