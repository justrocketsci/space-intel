import { createId } from "@paralleldrive/cuid2";
import {
  bigint,
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { vector } from "drizzle-orm/pg-core";

export const sectorEnum = pgEnum("sector", [
  "launch",
  "satellite",
  "ground_segment",
  "analytics",
  "manufacturing",
  "services",
  "other",
]);

export const companies = pgTable("companies", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  website: text("website"),
  foundedYear: integer("founded_year"),
  hqLocation: text("hq_location"),
  employeeCount: integer("employee_count"),
  isPublic: boolean("is_public").default(false),
  ticker: text("ticker"),
  marketCap: bigint("market_cap", { mode: "number" }),
  sector: sectorEnum("sector"),
  subSector: text("sub_sector"),
  tags: text("tags").array(),
  logoUrl: text("logo_url"),
  crunchbaseId: text("crunchbase_id"),
  secCik: text("sec_cik"),
  revenueEstimate: bigint("revenue_estimate", { mode: "number" }),
  fundingTotal: bigint("funding_total", { mode: "number" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  embedding: vector("embedding", { dimensions: 1536 }),
});

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
