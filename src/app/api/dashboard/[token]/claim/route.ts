import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// POST /api/dashboard/[token]/claim
// Legacy/seeded shops predate Clerk and have clerkUserId = null, so they're
// still reachable by token alone. This lets a signed-in vendor "claim" one —
// linking it to their account so future visits to /dashboard resolve
// straight to it, and so /dashboard/[token] starts enforcing ownership.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const { token } = await params;
  const shop = await prisma.shop.findUnique({ where: { dashboardToken: token } });
  if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

  if (shop.clerkUserId && shop.clerkUserId !== userId) {
    return NextResponse.json({ error: "This shop is already claimed by another account." }, { status: 403 });
  }

  const alreadyOwnsAnother = await prisma.shop.findUnique({ where: { clerkUserId: userId } });
  if (alreadyOwnsAnother && alreadyOwnsAnother.id !== shop.id) {
    return NextResponse.json({ error: "Your account is already linked to a different shop." }, { status: 409 });
  }

  await prisma.shop.update({ where: { id: shop.id }, data: { clerkUserId: userId } });
  return NextResponse.json({ ok: true });
}
