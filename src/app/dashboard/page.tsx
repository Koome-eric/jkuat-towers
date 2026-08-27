import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// /dashboard is the link vendors bookmark / the one Clerk sends them to
// after sign-in. It doesn't render anything itself — it just looks up the
// signed-in Clerk user's shop and hands off to the token'd route that
// holds the actual dashboard UI and its (already-scoped) API calls.
export default async function DashboardEntryPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const shop = await prisma.shop.findUnique({ where: { clerkUserId: userId }, select: { dashboardToken: true } });
  if (!shop) redirect("/onboard");

  redirect(`/dashboard/${shop.dashboardToken}`);
}
