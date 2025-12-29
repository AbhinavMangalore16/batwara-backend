import { pgTable, date, uuid, text, timestamp, index, uniqueIndex, integer, pgEnum } from 'drizzle-orm/pg-core';
import { user } from '../../user/repos/auth.schema';


// columns.helpers.ts
const timestamps = {
  updated_at: timestamp(),
  created_at: timestamp().defaultNow().notNull(),
  deleted_at: timestamp(),
}

export const splitTypeEnum = pgEnum('splitType', ['equal', 'exact', 'percentage']);

//Note:amount stored as paise

export const bill = pgTable('bill', {
    id: uuid().defaultRandom().primaryKey(),
    owner:text().references(()=>user.id),
    description:text('description'),
    totalAmount:integer().notNull(),
    splitType:splitTypeEnum(),
    ...timestamps,
    },
);

export const split = pgTable('split', {
    id: uuid().defaultRandom().primaryKey(),
    slave:text().references(()=>user.id),
    expenseId:uuid().references(()=>bill.id),
    splitAmount:integer().notNull(),
    ...timestamps,
    },
);