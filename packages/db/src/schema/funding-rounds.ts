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

export const fundingRounds = pgTable("funding_rounds", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  companyId: text("company_id").references(() => companies.id, {
    onDelete: "set null",
  }),
  roundType: text("round_type"), // 'seed', 'series_a', 'series_b', etc.
  amount: bigint("amount", { mode: "number" }),
  valuation: bigint("valuation", { mode: "number" }),
  announcedDate: date("announced_date"),
  investors: jsonb("investors"),
  source: text("source"),
  sourceUrl: text("source_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type FundingRound = typeof fundingRounds.$inferSelect;
export type NewFundingRound = typeof fundingRounds.$inferInsert;
