import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@space-intel/api";

/**
 * Typed tRPC React hooks — import `trpc` throughout the app
 * to get fully-typed query/mutation helpers.
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Returns the base URL for tRPC requests.
 * - On the server: uses VERCEL_URL env var (set automatically by Vercel) or falls back to localhost.
 * - In the browser: uses an empty string so requests are relative (same origin).
 */
export function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Browser — use relative URL
    return "";
  }

  if (process.env.VERCEL_URL) {
    // Vercel deployment
    return `https://${process.env.VERCEL_URL}`;
  }

  // Local development
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
