import { eq, sql } from "drizzle-orm";
import { db } from "@space-intel/db/client";
import { companies, contracts, dataSyncs } from "@space-intel/db/schema";
import { inngest } from "../client.js";
import {
  fetchAllSpaceContracts,
  mapToContract,
} from "../../sources/usaspending.js";

const SOURCE_NAME = "usaspending";

export const syncContracts = inngest.createFunction(
  {
    id: "sync-contracts",
    name: "Sync USAspending Contracts",
    retries: 3,
  },
  [
    // Scheduled trigger: daily at 2 AM UTC
    { cron: "0 2 * * *" },
    // Also allow manual trigger via event
    { event: "contracts/sync" },
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
      // 2. Fetch space contracts from USAspending (current + previous FY)
      // -----------------------------------------------------------------------
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const currentFY = currentMonth >= 10 ? currentYear + 1 : currentYear;
      const previousFY = currentFY - 1;

      const [currentFYContracts, previousFYContracts] = await step.run(
        "fetch-contracts",
        async () => {
          logger.info(`Fetching space contracts for FY${currentFY}`);
          const current = await fetchAllSpaceContracts(currentFY, 5);

          logger.info(`Fetching space contracts for FY${previousFY}`);
          const previous = await fetchAllSpaceContracts(previousFY, 5);

          return [current, previous] as const;
        },
      );

      const allAwards = [...currentFYContracts, ...previousFYContracts];
      logger.info(`Fetched ${allAwards.length} contracts total`);

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

      function resolveCompanyId(recipientName: string | null | undefined): string | null {
        if (!recipientName) return null;
        const lower = recipientName.toLowerCase();
        if (companyNameMap.has(lower)) return companyNameMap.get(lower) ?? null;
        for (const [name, id] of companyNameMap) {
          if (lower.includes(name) || name.includes(lower)) {
            return id;
          }
        }
        return null;
      }

      // -----------------------------------------------------------------------
      // 4. Upsert contracts into DB
      // -----------------------------------------------------------------------
      await step.run("upsert-contracts", async () => {
        for (const award of allAwards) {
          try {
            // Skip awards without a contract number — can't deduplicate
            const contractNumber = award["Award ID"] ?? award.Award_ID;
            if (!contractNumber) {
              logger.warn("Skipping award without Award ID");
              continue;
            }

            const mapped = mapToContract(award);
            const recipientName = award["Recipient Name"] ?? award.Recipient_Name;

            const values = {
              ...mapped,
              companyId: resolveCompanyId(recipientName),
            };

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

            itemsSynced += 1;
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            logger.error(`Failed to upsert contract: ${message}`);
            errors.push({
              message,
              context: { awardId: award["Award ID"] ?? award.Award_ID },
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
        `Sync complete: ${itemsSynced} contracts upserted, ${errors.length} errors`,
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
