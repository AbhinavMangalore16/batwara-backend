var neo4j = require('neo4j-driver');
import dotenv from "dotenv";
dotenv.config();


(async () => {
  const URI = process.env.NEO4J_URI
  const USER = process.env.NEO4J_USER
  const PASSWORD = process.env.NEO4J_PASSWORD
  let driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD))
  const serverInfo = await driver.getServerInfo()
  console.log('Connection established')
  console.log(serverInfo)

  await driver.close()
})();