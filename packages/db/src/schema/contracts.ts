import { createId } from "@paralleldrive/cuid2";
import {
  bigint,
  date,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { companies } from "./companies.js";

export const contracts = pgTable("contracts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  companyId: text("company_id").references(() => companies.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description"),
  awardingAgency: text("awarding_agency"),
  contractNumber: text("contract_number"),
  awardAmount: bigint("award_amount", { mode: "number" }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  contractType: text("contract_type"),
  source: text("source").notNull(), // 'usaspending' | 'sam' | 'sbir'
  sourceUrl: text("source_url"),
  rawData: jsonb("raw_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Contract = typeof contracts.$inferSelect;
export type NewContract = typeof contracts.$inferInsert;
