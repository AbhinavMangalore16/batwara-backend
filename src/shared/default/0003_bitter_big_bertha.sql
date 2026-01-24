CREATE TABLE "settlement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from" text NOT NULL,
	"to" text NOT NULL,
	"amount" integer NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "settlement" ADD CONSTRAINT "settlement_from_user_id_fk" FOREIGN KEY ("from") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlement" ADD CONSTRAINT "settlement_to_user_id_fk" FOREIGN KEY ("to") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "settlement_from_idx" ON "settlement" USING btree ("from");--> statement-breakpoint
CREATE INDEX "settlement_to_idx" ON "settlement" USING btree ("to");--> statement-breakpoint
CREATE INDEX "settlement_created_at_idx" ON "settlement" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "settlement_from_to_idx" ON "settlement" USING btree ("from","to");