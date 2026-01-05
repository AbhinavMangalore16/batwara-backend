import { pgTable, uuid, text, timestamp, integer, check } from 'drizzle-orm/pg-core';
import { sql } from "drizzle-orm";
import { user } from '../../user/repos/auth.schema';


// columns.helpers.ts
const timestamps = {
  updated_at: timestamp(),
  created_at: timestamp().defaultNow().notNull(),
  deleted_at: timestamp(),
}

//Note:amount stored as paise

export const bill = pgTable('bill', {
    id: uuid().defaultRandom().primaryKey(),
    owner:text().references(()=>user.id).notNull(),
    description:text('description'),
    totalAmount:integer().notNull(),
    splitType:text().notNull(),
    ...timestamps,
    },
    (table)=>[
      check("split_type_check1", sql`${table.splitType} in ('equal','percentage','exact')`),
    ]
);

export const split = pgTable('split', {
    id: uuid().defaultRandom().primaryKey(),
    slave:text().references(()=>user.id).notNull(),
    expenseId:uuid().references(()=>bill.id).notNull(),
    splitAmount:integer().notNull(),
    ...timestamps,
    },
);