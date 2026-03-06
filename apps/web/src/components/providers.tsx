"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { trpc, getBaseUrl } from "@/lib/trpc";

// Clerk is optional — only wrap in ClerkProvider if a real publishable key is set
const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const hasClerk = clerkPubKey.length > 0 && !clerkPubKey.includes("replace_me");

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR we usually want a default staleTime > 0 to avoid
        // refetching immediately on the client
        staleTime: 30 * 1000, // 30 seconds
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

// Global singleton for the browser — prevents QueryClient from being
// re-created on every render during server-side pre-rendering.
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    // Server: always create a new QueryClient
    return makeQueryClient();
  }
  // Browser: reuse the existing client or create a new one
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // NOTE: Avoid useState so we don't instantiate a client on every render.
  // Using getQueryClient() which is stable for the browser session.
  const queryClient = getQueryClient();

  const [trpcClient] = React.useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
          headers() {
            return {
              "x-trpc-source": "react",
            };
          },
        }),
      ],
    })
  );

  const inner = (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );

  if (!hasClerk) {
    return inner;
  }

  // Dynamically import ClerkProvider only when keys are configured
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ClerkProvider } = require("@clerk/nextjs") as typeof import("@clerk/nextjs");
  return <ClerkProvider>{inner}</ClerkProvider>;
}
