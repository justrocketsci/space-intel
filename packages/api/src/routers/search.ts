import { ilike, or } from "drizzle-orm";
import { z } from "zod";
import { companies, contracts, launches } from "@space-intel/db/schema";
import { publicProcedure, router } from "../trpc.js";

export const searchRouter = router({
  global: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().int().min(1).max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { query, limit } = input;
      const pattern = `%${query}%`;

      const [matchedCompanies, matchedContracts, matchedLaunches] =
        await Promise.all([
          ctx.db
            .select()
            .from(companies)
            .where(
              or(
                ilike(companies.name, pattern),
                ilike(companies.description, pattern),
              ),
            )
            .orderBy(companies.name)
            .limit(limit),

          ctx.db
            .select()
            .from(contracts)
            .where(
              or(
                ilike(contracts.title, pattern),
                ilike(contracts.description, pattern),
              ),
            )
            .orderBy(contracts.createdAt)
            .limit(limit),

          ctx.db
            .select()
            .from(launches)
            .where(ilike(launches.missionName, pattern))
            .orderBy(launches.launchDate)
            .limit(limit),
        ]);

      return {
        companies: matchedCompanies,
        contracts: matchedContracts,
        launches: matchedLaunches,
      };
    }),
});
