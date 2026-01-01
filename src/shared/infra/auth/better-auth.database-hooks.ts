import type { BetterAuthOptions } from "better-auth";
import { graph } from "../db/neo4j/neo4j-client.config";

export const databaseHooks:BetterAuthOptions["databaseHooks"] = {
		user: {
			create: {
				after: async (user) => {
					const driver = graph();
					console.log(user,"my user")
					let { records, summary } = await driver.executeQuery(`
						CREATE (p:Person {id: $userId})`,
						{ userId:user.id }
					)
					// Summary information
					console.log(
					`The query \`${summary.query.text}\` ` +
					`returned ${records.length} nodes.\n`
					)
				}
			},
			delete: {
				after: async (user) => {
					const driver = graph();
					let { records, summary } = await driver.executeQuery(`
						MATCH (p:Person WHERE p.id = $userId)
  						DETACH DELETE p`,
						{ userId : user.id}
					)
					// Summary information
					console.log(
					`The query \`${summary.query.text}\` ` +
					`returned ${records.length} nodes.\n`
					)
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