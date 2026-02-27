import { and, count, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import {
  companies,
  contracts,
  filings,
  fundingRounds,
  launches,
} from "@space-intel/db/schema";
import { publicProcedure, router } from "../trpc.js";

export const companiesRouter = router({
  list: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        sector: z.string().optional(),
        isPublic: z.boolean().optional(),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { search, sector, isPublic, limit, offset } = input;

      const filters = [];

      if (search) {
        filters.push(
          or(
            ilike(companies.name, `%${search}%`),
            ilike(companies.description, `%${search}%`),
          ),
        );
      }

      if (sector) {
        filters.push(
          eq(
            companies.sector,
            sector as
              | "launch"
              | "satellite"
              | "ground_segment"
              | "analytics"
              | "manufacturing"
              | "services"
              | "other",
          ),
        );
      }

      if (isPublic !== undefined) {
        filters.push(eq(companies.isPublic, isPublic));
      }

      const whereClause = filters.length > 0 ? and(...filters) : undefined;

      const [items, totalResult] = await Promise.all([
        ctx.db
          .select()
          .from(companies)
          .where(whereClause)
          .orderBy(companies.name)
          .limit(limit)
          .offset(offset),
        ctx.db
          .select({ count: count() })
          .from(companies)
          .where(whereClause),
      ]);

      const total = totalResult[0]?.count ?? 0;

      return { items, total };
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const company = await ctx.db
        .select()
        .from(companies)
        .where(eq(companies.slug, input.slug))
        .limit(1);

      if (!company[0]) {
        throw new Error(`Company not found: ${input.slug}`);
      }

      const companyId = company[0].id;

      const [relatedContracts, relatedLaunches, relatedFilings, relatedFunding] =
        await Promise.all([
          ctx.db
            .select()
            .from(contracts)
            .where(eq(contracts.companyId, companyId))
            .orderBy(contracts.createdAt)
            .limit(50),
          ctx.db
            .select()
            .from(launches)
            .where(eq(launches.providerId, companyId))
            .orderBy(launches.launchDate)
            .limit(50),
          ctx.db
            .select()
            .from(filings)
            .where(eq(filings.companyId, companyId))
            .orderBy(filings.filedDate)
            .limit(50),
          ctx.db
            .select()
            .from(fundingRounds)
            .where(eq(fundingRounds.companyId, companyId))
            .orderBy(fundingRounds.announcedDate)
            .limit(50),
        ]);

      return {
        ...company[0],
        contracts: relatedContracts,
        launches: relatedLaunches,
        filings: relatedFilings,
        fundingRounds: relatedFunding,
      };
    }),

  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().int().min(1).max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.db
        .select()
        .from(companies)
        .where(
          or(
            ilike(companies.name, `%${input.query}%`),
            ilike(companies.description, `%${input.query}%`),
          ),
        )
        .orderBy(companies.name)
        .limit(input.limit);

      return results;
    }),
});
