import { eq, sql } from "drizzle-orm";
import { db } from "@space-intel/db/client";
import { companies, contracts, dataSyncs } from "@space-intel/db/schema";
import { inngest } from "../client.js";
import {
  fetchSpaceAwards,
  mapToContract,
} from "../../sources/sbir.js";

const SOURCE_NAME = "sbir";

export const syncSbir = inngest.createFunction(
  {
    id: "sync-sbir",
    name: "Sync SBIR/STTR Awards",
    retries: 3,
  },
  [
    // Scheduled trigger: weekly on Monday at 3 AM UTC
    { cron: "0 3 * * 1" },
    // Also allow manual trigger via event
    { event: "sbir/sync" },
  ],
  async ({ step, logger }) => {
    // -----------------------------------------------------------------------
    // 1. Record sync start
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
      // 2. Fetch space-related SBIR/STTR awards
      //    Fetch current year + previous year for coverage
      // -----------------------------------------------------------------------
      const currentYear = new Date().getFullYear();

      const [currentYearAwards, previousYearAwards] = await step.run(
        "fetch-sbir-awards",
        async () => {
          logger.info(`Fetching SBIR awards for ${currentYear}`);
          const current = await fetchSpaceAwards(currentYear);

          logger.info(`Fetching SBIR awards for ${currentYear - 1}`);
          const previous = await fetchSpaceAwards(currentYear - 1);

          return [current, previous] as const;
        },
      );

      const allAwards = [...currentYearAwards, ...previousYearAwards];

      // De-duplicate by contract number in case same award matched multiple keywords
      const deduped = new Map<string, (typeof allAwards)[number]>();
      for (const award of allAwards) {
        const key =
          award.contract ??
          `${award.firm ?? ""}::${award.award_title ?? ""}::${award.award_year ?? ""}`;
        if (!deduped.has(key)) {
          deduped.set(key, award);
        }
      }

      const uniqueAwards = [...deduped.values()];
      logger.info(
        `Fetched ${allAwards.length} awards, ${uniqueAwards.length} unique`,
      );

      // -----------------------------------------------------------------------
      // 3. Load companies for name-based matching
      // -----------------------------------------------------------------------
      const companyList = await step.run("load-companies", async () => {
        return db
          .select({ id: companies.id, name: companies.name })
          .from(companies);
      });

      const companyNameMap = new Map<string, string>(
        companyList.map((c) => [c.name.toLowerCase(), c.id]),
      );

      function resolveCompanyId(firmName: string | null | undefined): string | null {
        if (!firmName) return null;
        const lower = firmName.toLowerCase();
        if (companyNameMap.has(lower)) return companyNameMap.get(lower) ?? null;
        for (const [name, id] of companyNameMap) {
          if (lower.includes(name) || name.includes(lower)) {
            return id;
          }
        }
        return null;
      }

      // -----------------------------------------------------------------------
      // 4. Upsert SBIR awards into contracts table
      // -----------------------------------------------------------------------
      await step.run("upsert-sbir-awards", async () => {
        for (const award of uniqueAwards) {
          try {
            // Skip awards without a contract number
            if (!award.contract && !award.award_title) {
              logger.warn("Skipping SBIR award without contract number or title");
              continue;
            }

            const mapped = mapToContract(award);
            const values = {
              ...mapped,
              companyId: resolveCompanyId(award.firm),
            };

            if (mapped.contractNumber) {
              // We have a contract number — use it for conflict detection
              await db
                .insert(contracts)
                .values(values)
                .onConflictDoUpdate({
                  target: contracts.contractNumber,
                  set: {
                    title: sql`excluded.title`,
                    description: sql`excluded.description`,
                    awardingAgency: sql`excluded.awarding_agency`,
                    awardAmount: sql`excluded.award_amount`,
                    startDate: sql`excluded.start_date`,
                    endDate: sql`excluded.end_date`,
                    contractType: sql`excluded.contract_type`,
                    companyId: sql`excluded.company_id`,
                    rawData: sql`excluded.raw_data`,
                  },
                });
            } else {
              // No contract number — insert without conflict handling
              // (title + firm combination makes these effectively unique enough)
              await db.insert(contracts).values(values);
            }

            itemsSynced += 1;
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            logger.error(`Failed to upsert SBIR award: ${message}`);
            errors.push({
              message,
              context: {
                contract: award.contract,
                firm: award.firm,
              },
            });
          }
        }
      });

      // -----------------------------------------------------------------------
      // 5. Mark sync as complete
      // -----------------------------------------------------------------------
      await step.run("update-sync-success", async () => {
        await db
          .update(dataSyncs)
          .set({
            status: "completed",
            lastSyncedAt: new Date(),
            itemsSynced,
            errors: errors.length > 0 ? errors : null,
          })
          .where(eq(dataSyncs.id, syncRecord.id));
      });

      logger.info(
        `Sync complete: ${itemsSynced} SBIR awards upserted, ${errors.length} errors`,
      );

      return { itemsSynced, errorCount: errors.length };
    } catch (err) {
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
