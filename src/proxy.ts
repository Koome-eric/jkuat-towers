import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Everything is public by default (storefronts, search, the WhatsApp
// webhook, the customer-facing assistant) — only the vendor-only surfaces
// require a signed-in Clerk user. /dashboard/[token] itself stays
// reachable without Clerk for legacy/seeded shops that haven't been claimed
// yet (see that page's own ownership check), but the canonical /dashboard
// entry point and /onboard require sign-in.
const isProtectedRoute = createRouteMatcher(["/dashboard", "/onboard(.*)", "/api/onboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for Clerk's auto-proxy path
    "/__clerk/:path*",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};