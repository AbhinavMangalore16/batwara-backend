import { pgTable, date, uuid, text, timestamp } from 'drizzle-orm/pg-core';

// columns.helpers.ts
const timestamps = {
  updated_at: timestamp(),
  created_at: timestamp().defaultNow().notNull(),
  deleted_at: timestamp(),
}


export const Users = pgTable('users', {
  id: uuid().defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email:text('email').notNull().unique(),
  hashed_password:text().notNull(),
  dob:date(),
  ...timestamps,
});