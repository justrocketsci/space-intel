import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { launches } from "@space-intel/db/schema";
import { publicProcedure, router } from "../trpc.js";

export const launchesRouter = router({
  upcoming: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();

      const results = await ctx.db
        .select()
        .from(launches)
        .where(
          and(
            eq(launches.status, "upcoming"),
            gte(launches.launchDate, now),
          ),
        )
        .orderBy(launches.launchDate)
        .limit(input.limit);

      return results;
    }),

  history: publicProcedure
    .input(
      z.object({
        providerId: z.string().optional(),
        status: z
          .enum(["success", "failure", "partial", "unknown"])
          .optional(),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { providerId, status, limit, offset } = input;

      const filters = [
        sql`${launches.status} != 'upcoming'`,
      ];

      if (providerId) {
        filters.push(eq(launches.providerId, providerId));
      }

      if (status) {
        filters.push(eq(launches.status, status));
      }

      const whereClause = and(...filters);

      const [items, totalResult] = await Promise.all([
        ctx.db
          .select()
          .from(launches)
          .where(whereClause)
          .orderBy(desc(launches.launchDate))
          .limit(limit)
          .offset(offset),
        ctx.db
          .select({ count: count() })
          .from(launches)
          .where(whereClause),
      ]);

      const total = totalResult[0]?.count ?? 0;

      return { items, total };
    }),

  stats: publicProcedure.query(async ({ ctx }) => {
    const [totalsResult, byYearResult, byProviderResult, successResult] =
      await Promise.all([
        ctx.db
          .select({ totalLaunches: count() })
          .from(launches)
          .where(sql`${launches.status} != 'upcoming'`),

        ctx.db
          .select({
            year: sql<number>`EXTRACT(YEAR FROM ${launches.launchDate})::int`,
            launchCount: count(),
          })
          .from(launches)
          .where(
            and(
              sql`${launches.status} != 'upcoming'`,
              sql`${launches.launchDate} IS NOT NULL`,
              gte(
                launches.launchDate,
                new Date(new Date().getFullYear() - 10, 0, 1),
              ),
            ),
          )
          .groupBy(sql`EXTRACT(YEAR FROM ${launches.launchDate})`)
          .orderBy(sql`EXTRACT(YEAR FROM ${launches.launchDate}) asc`),

        ctx.db
          .select({
            providerId: launches.providerId,
            launchCount: count(),
          })
          .from(launches)
          .where(
            and(
              sql`${launches.status} != 'upcoming'`,
              sql`${launches.providerId} IS NOT NULL`,
            ),
          )
          .groupBy(launches.providerId)
          .orderBy(sql`count(*) desc`)
          .limit(10),

        ctx.db
          .select({
            status: launches.status,
            statusCount: count(),
          })
          .from(launches)
          .where(sql`${launches.status} != 'upcoming'`)
          .groupBy(launches.status),
      ]);

    const totalLaunches = totalsResult[0]?.totalLaunches ?? 0;

    const successCount =
      successResult.find((r) => r.status === "success")?.statusCount ?? 0;
    const successRate =
      totalLaunches > 0
        ? Math.round((successCount / totalLaunches) * 100 * 10) / 10
        : 0;

    return {
      totalLaunches,
      successRate,
      launchesByYear: byYearResult.map((row) => ({
        year: row.year,
        count: row.launchCount,
      })),
      launchesByProvider: byProviderResult.map((row) => ({
        providerId: row.providerId ?? "Unknown",
        count: row.launchCount,
      })),
    };
  }),
});
