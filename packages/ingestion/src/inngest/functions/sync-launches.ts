import { eq, sql } from "drizzle-orm";
import { db } from "@space-intel/db/client";
import { companies, dataSyncs, launches } from "@space-intel/db/schema";
import { inngest } from "../client.js";
import {
  fetchUpcomingLaunches,
  fetchPastLaunches,
  mapToLaunch,
} from "../../sources/launch-library.js";

const SOURCE_NAME = "launch-library-2";

export const syncLaunches = inngest.createFunction(
  {
    id: "sync-launches",
    name: "Sync Launch Library 2",
    // Retry up to 3 times with exponential back-off
    retries: 3,
  },
  [
    // Scheduled trigger: every 6 hours
    { cron: "0 */6 * * *" },
    // Also allow manual trigger via event
    { event: "launches/sync" },
  ],
  async ({ step, logger }) => {
    // -----------------------------------------------------------------------
    // 1. Record sync start in data_syncs table
    // -----------------------------------------------------------------------
    const syncRecord = await step.run("create-sync-record", async () => {
      const [record] = await db
        .insert(dataSyncs)
        .values({
          sourceName: SOURCE_NAME,
          status: "running",
          itemsSynced: 0,
        })
        .returning();
      return record;
    });

    if (!syncRecord) {
      throw new Error("Failed to create sync record");
    }

    const errors: Array<{ message: string; context?: unknown }> = [];
    let itemsSynced = 0;

    try {
      // -----------------------------------------------------------------------
      // 2. Fetch upcoming + recent past launches
      // -----------------------------------------------------------------------
      const [upcomingRaw, pastRaw] = await step.run("fetch-launches", async () => {
        logger.info("Fetching upcoming launches from Launch Library 2");
        const upcoming = await fetchUpcomingLaunches(100);

        logger.info("Fetching past launches from Launch Library 2");
        const past = await fetchPastLaunches(100, 0);

        return [upcoming, past] as const;
      });

      const allRaw = [...upcomingRaw, ...pastRaw];
      logger.info(`Fetched ${allRaw.length} launches total`);

      // -----------------------------------------------------------------------
      // 3. Load existing companies for name-based matching
      // -----------------------------------------------------------------------
      const companyList = await step.run("load-companies", async () => {
        return db
          .select({ id: companies.id, name: companies.name })
          .from(companies);
      });

      // Build a lowercase name → id map for fuzzy matching
      const companyNameMap = new Map<string, string>(
        companyList.map((c) => [c.name.toLowerCase(), c.id]),
      );

      function resolveCompanyId(providerName: string | null | undefined): string | null {
        if (!providerName) return null;
        const lower = providerName.toLowerCase();
        // Exact match first
        if (companyNameMap.has(lower)) return companyNameMap.get(lower) ?? null;
        // Partial match — provider name starts with a known company name or vice-versa
        for (const [name, id] of companyNameMap) {
          if (lower.includes(name) || name.includes(lower)) {
            return id;
          }
        }
        return null;
      }

      // -----------------------------------------------------------------------
      // 4. Upsert launches into the DB
      // -----------------------------------------------------------------------
      await step.run("upsert-launches", async () => {
        for (const raw of allRaw) {
          try {
            const mapped = mapToLaunch(raw);
            const providerName = raw.launch_service_provider?.name ?? null;

            const values = {
              ...mapped,
              providerId: resolveCompanyId(providerName),
            };

            await db
              .insert(launches)
              .values(values)
              .onConflictDoUpdate({
                target: launches.sourceId,
                set: {
                  missionName: sql`excluded.mission_name`,
                  launchDate: sql`excluded.launch_date`,
                  status: sql`excluded.status`,
                  vehicle: sql`excluded.vehicle`,
                  padLocation: sql`excluded.pad_location`,
                  orbitType: sql`excluded.orbit_type`,
                  customer: sql`excluded.customer`,
                  providerId: sql`excluded.provider_id`,
                  sourceUrl: sql`excluded.source_url`,
                },
              });

            itemsSynced += 1;
          } catch (err) {
            const message =
              err instanceof Error ? err.message : String(err);
            logger.error(`Failed to upsert launch ${raw.id}: ${message}`);
            errors.push({ message, context: { launchId: raw.id } });
          }
        }
      });

      // -----------------------------------------------------------------------
      // 5. Update sync record — success
      // -----------------------------------------------------------------------
      await step.run("update-sync-success", async () => {
        await db
          .update(dataSyncs)
          .set({
            status: errors.length > 0 ? "completed" : "completed",
            lastSyncedAt: new Date(),
            itemsSynced,
            errors: errors.length > 0 ? errors : null,
          })
          .where(eq(dataSyncs.id, syncRecord.id));
      });

      logger.info(`Sync complete: ${itemsSynced} launches upserted, ${errors.length} errors`);

      return { itemsSynced, errorCount: errors.length };
    } catch (err) {
      // -----------------------------------------------------------------------
      // Fatal error — update sync record with failure
      // -----------------------------------------------------------------------
      const message = err instanceof Error ? err.message : String(err);
      logger.error(`Sync failed: ${message}`);

      await db
        .update(dataSyncs)
        .set({
          status: "failed",
          lastSyncedAt: new Date(),
          itemsSynced,
          errors: [{ message }, ...errors],
        })
        .where(eq(dataSyncs.id, syncRecord.id));

      throw err;
    }
  },
);
