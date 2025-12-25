import { pgTable, date, uuid, text, timestamp, index, uniqueIndex, integer } from 'drizzle-orm/pg-core';
import { user } from '../../user/repos/auth.schema';


// columns.helpers.ts
const timestamps = {
  updated_at: timestamp(),
  created_at: timestamp().defaultNow().notNull(),
  deleted_at: timestamp(),
}

//Note:amount stored as paise

export const expense = pgTable('expense', {
    id: uuid().defaultRandom().primaryKey(),
    owner:text().references(()=>user.id),
    description:text('description'),
    amount:integer().notNull(),
    ...timestamps,
    },
);

export const split = pgTable('split', {
    id: uuid().defaultRandom().primaryKey(),
    slave:text().references(()=>user.id),
    expenseId:uuid().references(()=>expense.id),
    splitAmount:integer().notNull(),
    ...timestamps,
    },
);