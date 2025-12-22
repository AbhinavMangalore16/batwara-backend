import { defineConfig } from 'drizzle-kit';

if (!process.env.PG_DATABASE_URL) {
  throw new Error('PG_DATABASE_URL is not set in the .env file');
}

export default defineConfig({
  schema: './src/shared/infra/db/postgres/drizzle.schema.ts', // Your schema file path
  out: './src/shared/infra/db/drizzle', // Your migrations folder
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.PG_DATABASE_URL,
  },
});