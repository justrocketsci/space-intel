import { createId } from "@paralleldrive/cuid2";
import {
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { companies } from "./companies.js";

export const launchStatusEnum = pgEnum("launch_status", [
  "upcoming",
  "success",
  "failure",
  "partial",
  "unknown",
]);

export const launches = pgTable("launches", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  missionName: text("mission_name").notNull(),
  providerId: text("provider_id").references(() => companies.id, {
    onDelete: "set null",
  }),
  launchDate: timestamp("launch_date"),
  status: launchStatusEnum("status").notNull(),
  vehicle: text("vehicle"),
  padLocation: text("pad_location"),
  orbitType: text("orbit_type"),
  payloadMassKg: real("payload_mass_kg"),
  customer: text("customer"),
  source: text("source"),
  sourceUrl: text("source_url"),
  sourceId: text("source_id"), // external ID for deduplication
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Launch = typeof launches.$inferSelect;
export type NewLaunch = typeof launches.$inferInsert;
