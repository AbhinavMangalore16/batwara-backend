import neo4j from "neo4j-driver" 

const URI = process.env.NEO4J_URI;
const USER = process.env.NEO4J_USER;
const PASSWORD = process.env.NEO4J_PASSWORD;
if(!URI || !USER || !PASSWORD){
  throw new Error("env vars not defined for neo4j");
}

export const graphDb = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));


