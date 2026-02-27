import { type NextRequest, NextResponse } from "next/server";

// Clerk is optional — only enforce auth when a real secret key is configured
const clerkSecret = process.env.CLERK_SECRET_KEY ?? "";
const hasClerk = clerkSecret.length > 0 && !clerkSecret.includes("replace_me");

export default async function middleware(request: NextRequest) {
  if (!hasClerk) {
    // No Clerk configured — allow all requests through
    return NextResponse.next();
  }

  // Dynamically load Clerk middleware only when keys are present
  const { clerkMiddleware, createRouteMatcher } = await import(
    "@clerk/nextjs/server"
  );

  const isPublicRoute = createRouteMatcher([
    "/",
    "/companies(.*)",
    "/launches(.*)",
    "/research(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/inngest(.*)",
    "/api/trpc(.*)",
  ]);

  const handler = clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
  });

  return handler(request, {} as never);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
