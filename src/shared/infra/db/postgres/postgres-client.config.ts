// For Node.js - make sure to install the 'ws' and 'bufferutil' packages
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from "./drizzle.schema";

neonConfig.webSocketConstructor = ws;
if (!process.env.PG_DATABASE_URL) {
  throw new Error('PG_DATABASE_URL environment variable is required');
}
const pool = new Pool({ connectionString: process.env.PG_DATABASE_URL });
export const db = drizzle(pool,{schema})

// const result = await db.execute('select 1');



// import * as schema from "./drizzle.schema";

// const sql = neon(process.env.PG_DATABASE_URL!);
// export const db = drizzle({client:sql},{schema});