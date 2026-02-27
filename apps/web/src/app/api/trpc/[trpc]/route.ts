import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@space-intel/api";
import { db } from "@space-intel/db/client";
import { auth } from "@clerk/nextjs/server";

function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      const { userId } = await auth();
      return { db, userId };
    },
    onError({ error, path }) {
      console.error(`tRPC error on '${path ?? "<no-path>"}':`, error.message);
    },
  });
}

export { handler as GET, handler as POST };
