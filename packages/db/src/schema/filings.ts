import { createId } from "@paralleldrive/cuid2";
import {
  date,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { vector } from "drizzle-orm/pg-core";
import { companies } from "./companies.js";

export const filings = pgTable("filings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  companyId: text("company_id").references(() => companies.id, {
    onDelete: "set null",
  }),
  filingType: text("filing_type").notNull(), // '10-K', '10-Q', '8-K', etc.
  filedDate: date("filed_date"),
  periodOfReport: date("period_of_report"),
  title: text("title"),
  description: text("description"),
  summary: text("summary"), // AI-generated summary
  sourceUrl: text("source_url"),
  documentUrl: text("document_url"),
  embedding: vector("embedding", { dimensions: 1536 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Filing = typeof filings.$inferSelect;
export type NewFiling = typeof filings.$inferInsert;
