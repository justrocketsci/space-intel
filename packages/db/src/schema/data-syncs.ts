import { createId } from "@paralleldrive/cuid2";
import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const dataSyncs = pgTable("data_syncs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  sourceName: text("source_name").notNull(),
  lastSyncedAt: timestamp("last_synced_at"),
  status: text("status").notNull(), // 'running' | 'completed' | 'failed'
  itemsSynced: integer("items_synced").default(0),
  errors: jsonb("errors"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DataSync = typeof dataSyncs.$inferSelect;
export type NewDataSync = typeof dataSyncs.$inferInsert;
