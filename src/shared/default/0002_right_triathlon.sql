ALTER TABLE "bill" ALTER COLUMN "owner" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "split" ALTER COLUMN "slave" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "split" ALTER COLUMN "expenseId" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "bill_owner_idx" ON "bill" USING btree ("owner");--> statement-breakpoint
CREATE INDEX "bill_created_at_idx" ON "bill" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "bill_owner_createdat_idx" ON "bill" USING btree ("owner","created_at");--> statement-breakpoint
CREATE INDEX "split_slave_idx" ON "split" USING btree ("slave");--> statement-breakpoint
CREATE INDEX "split_expenseid_idx" ON "split" USING btree ("expenseId");--> statement-breakpoint
CREATE INDEX "split_expense_slave_idx" ON "split" USING btree ("expenseId","slave");--> statement-breakpoint
CREATE INDEX "split_created_at_idx" ON "split" USING btree ("created_at");