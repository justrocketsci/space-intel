import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { type db as DbType } from "@space-intel/db/client";

export type Context = {
  db: typeof DbType;
  userId: string | null;
};

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const enforceUserIsAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthenticated);
