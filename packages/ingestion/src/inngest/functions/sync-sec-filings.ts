import { eq, isNotNull, sql } from "drizzle-orm";
import { db } from "@space-intel/db/client";
import { companies, dataSyncs, filings } from "@space-intel/db/schema";
import { inngest } from "../client.js";
import {
  fetchFilings,
  mapToFiling,
  DEFAULT_FILING_TYPES,
} from "../../sources/sec-edgar.js";

const SOURCE_NAME = "sec-edgar";

// Accession number uniquely identifies a filing, but we store it in sourceUrl.
// We use a composite of companyId + accessionNumber embedded in the documentUrl
// to detect duplicates at the application level.

export const syncSecFilings = inngest.createFunction(
  {
    id: "sync-sec-filings",
    name: "Sync SEC EDGAR Filings",
    retries: 3,
    // Respect SEC rate limiting — sequential processing
    concurrency: {
      limit: 1,
      key: "event.data.source",
    },
  },
  [
    // Scheduled trigger: every 4 hours
    { cron: "0 */4 * * *" },
    // Also allow manual trigger via event
    { event: "filings/sync" },
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
      // 2. Get all public companies that have an SEC CIK
      // -----------------------------------------------------------------------
      const publicCompanies = await step.run("load-public-companies", async () => {
        return db
          .select({ id: companies.id, name: companies.name, secCik: companies.secCik })
          .from(companies)
          .where(isNotNull(companies.secCik));
      });

      logger.info(
        `Found ${publicCompanies.length} public companies with SEC CIK`,
      );

      if (publicCompanies.length === 0) {
        await db
          .update(dataSyncs)
          .set({
            status: "completed",
            lastSyncedAt: new Date(),
            itemsSynced: 0,
            errors: null,
          })
          .where(eq(dataSyncs.id, syncRecord.id));

        return { itemsSynced: 0, errorCount: 0 };
      }

      // -----------------------------------------------------------------------
      // 3. Fetch and upsert filings per company
      //    We process companies one at a time to respect SEC rate limits.
      //    The SEC asks for no more than 10 requests per second.
      // -----------------------------------------------------------------------
      for (const company of publicCompanies) {
        if (!company.secCik) continue;

        await step.run(`fetch-filings-${company.id}`, async () => {
          logger.info(
            `Fetching filings for ${company.name} (CIK: ${company.secCik})`,
          );

          let edgarFilings;
          try {
            edgarFilings = await fetchFilings(company.secCik!, [
              ...DEFAULT_FILING_TYPES,
            ]);
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            logger.error(
              `Failed to fetch filings for ${company.name}: ${message}`,
            );
            errors.push({
              message,
              context: { companyId: company.id, cik: company.secCik },
            });
            return;
          }

          logger.info(
            `Found ${edgarFilings.length} filings for ${company.name}`,
          );

          for (const edgarFiling of edgarFilings) {
            try {
              const mapped = mapToFiling(edgarFiling, company.secCik!);

              await db
                .insert(filings)
                .values({
                  ...mapped,
                  companyId: company.id,
                })
                .onConflictDoUpdate({
                  // The accession number is embedded in the documentUrl which we
                  // use as our conflict key via sourceUrl. Use documentUrl for
                  // uniqueness since it contains company CIK + accessionNumber.
                  target: filings.documentUrl,
                  set: {
                    filingType: sql`excluded.filing_type`,
                    filedDate: sql`excluded.filed_date`,
                    periodOfReport: sql`excluded.period_of_report`,
                    title: sql`excluded.title`,
                    description: sql`excluded.description`,
                    sourceUrl: sql`excluded.source_url`,
                    companyId: sql`excluded.company_id`,
                  },
                });

              itemsSynced += 1;
            } catch (err) {
              const message = err instanceof Error ? err.message : String(err);
              logger.error(
                `Failed to upsert filing ${edgarFiling.accessionNumber}: ${message}`,
              );
              errors.push({
                message,
                context: {
                  companyId: company.id,
                  accessionNumber: edgarFiling.accessionNumber,
                },
              });
            }
          }
        });

        // Polite delay between companies to respect SEC rate limit
        await step.sleep("sec-rate-limit-delay", "200ms");
      }

      // -----------------------------------------------------------------------
      // 4. Mark sync as complete
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
        `Sync complete: ${itemsSynced} filings upserted, ${errors.length} errors`,
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
