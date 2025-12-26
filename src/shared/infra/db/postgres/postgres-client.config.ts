import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from "./drizzle.schema";

const sql = neon(process.env.PG_DATABASE_URL!);
export const db = drizzle(sql,{schema});