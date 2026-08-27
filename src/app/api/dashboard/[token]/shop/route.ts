import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Currently just the storefront theme color, but scoped as a general
// "shop settings" endpoint so other vendor-editable storefront fields
// (aboutBusiness, openingHours, etc.) can be added here later without a
// new route.
const patchSchema = z.object({
  themeColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "themeColor must be a hex color like #3452FF")
    .nullable()
    .optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const shop = await prisma.shop.findUnique({ where: { dashboardToken: token } });
  if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.shop.update({
    where: { id: shop.id },
    data: parsed.data,
    select: { themeColor: true },
  });

  return NextResponse.json({ shop: updated });
}
