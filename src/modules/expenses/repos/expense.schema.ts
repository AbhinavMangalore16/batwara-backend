import { pgTable, uuid, text, timestamp, integer, check, index } from 'drizzle-orm/pg-core';
import { sql } from "drizzle-orm";
import { user } from '../../user/repos/auth.schema';
import { table } from 'console';


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
      index("bill_owner_idx").on(table.owner),
      index("bill_created_at_idx").on(table.created_at),
      index("bill_owner_createdat_idx").on(table.owner, table.created_at)
    ]
);

export const split = pgTable('split', {
    id: uuid().defaultRandom().primaryKey(),
    slave:text().references(()=>user.id).notNull(),
    expenseId:uuid().references(()=>bill.id).notNull(),
    splitAmount:integer().notNull(),
    ...timestamps,
    },
    (table)=>[
      index("split_slave_idx").on(table.slave),
      index("split_expenseid_idx").on(table.expenseId),
      index("split_expense_slave_idx").on(table.expenseId, table.slave),
      index("split_created_at_idx").on(table.created_at)
    ]
);