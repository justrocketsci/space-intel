import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@space-intel/api";
import { db } from "@space-intel/db/client";

const clerkSecret = process.env.CLERK_SECRET_KEY ?? "";
const hasClerk = clerkSecret.length > 0 && !clerkSecret.includes("replace_me");

async function getUserId(): Promise<string | null> {
  if (!hasClerk) return null;
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    return userId;
  } catch {
    return null;
  }
}

function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      const userId = await getUserId();
      return { db, userId };
    },
    onError({ error, path }) {
      console.error(`tRPC error on '${path ?? "<no-path>"}':`, error.message);
    },
  });
}

export { handler as GET, handler as POST };
