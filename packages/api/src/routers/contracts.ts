import { and, count, eq, gte, sql, sum } from "drizzle-orm";
import { z } from "zod";
import { contracts } from "@space-intel/db/schema";
import { publicProcedure, router } from "../trpc.js";

export const contractsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        companyId: z.string().optional(),
        source: z.string().optional(),
        minAmount: z.number().optional(),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { companyId, source, minAmount, limit, offset } = input;

      const filters = [];

      if (companyId) {
        filters.push(eq(contracts.companyId, companyId));
      }

      if (source) {
        filters.push(eq(contracts.source, source));
      }

      if (minAmount !== undefined) {
        filters.push(gte(contracts.awardAmount, minAmount));
      }

      const whereClause = filters.length > 0 ? and(...filters) : undefined;

      const [items, totalResult] = await Promise.all([
        ctx.db
          .select()
          .from(contracts)
          .where(whereClause)
          .orderBy(contracts.createdAt)
          .limit(limit)
          .offset(offset),
        ctx.db
          .select({ count: count() })
          .from(contracts)
          .where(whereClause),
      ]);

      const total = totalResult[0]?.count ?? 0;

      return { items, total };
    }),

  stats: publicProcedure.query(async ({ ctx }) => {
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    const [totalsResult, byAgencyResult, byYearResult] = await Promise.all([
      ctx.db
        .select({
          totalContracts: count(),
          totalValue: sum(contracts.awardAmount),
        })
        .from(contracts),

      ctx.db
        .select({
          agency: contracts.awardingAgency,
          contractCount: count(),
          totalValue: sum(contracts.awardAmount),
        })
        .from(contracts)
        .where(sql`${contracts.awardingAgency} IS NOT NULL`)
        .groupBy(contracts.awardingAgency)
        .orderBy(sql`count(*) desc`)
        .limit(10),

      ctx.db
        .select({
          year: sql<number>`EXTRACT(YEAR FROM ${contracts.createdAt})::int`,
          contractCount: count(),
          totalValue: sum(contracts.awardAmount),
        })
        .from(contracts)
        .where(gte(contracts.createdAt, fiveYearsAgo))
        .groupBy(sql`EXTRACT(YEAR FROM ${contracts.createdAt})`)
        .orderBy(sql`EXTRACT(YEAR FROM ${contracts.createdAt}) asc`),
    ]);

    const totals = totalsResult[0];

    return {
      totalContracts: totals?.totalContracts ?? 0,
      totalValue: totals?.totalValue ?? 0,
      byAgency: byAgencyResult.map((row) => ({
        agency: row.agency ?? "Unknown",
        contractCount: row.contractCount,
        totalValue: row.totalValue ?? 0,
      })),
      byYear: byYearResult.map((row) => ({
        year: row.year,
        contractCount: row.contractCount,
        totalValue: row.totalValue ?? 0,
      })),
    };
  }),
});
