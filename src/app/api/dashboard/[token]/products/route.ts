import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const productSchema = z.object({
  name: z.string().min(1),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0).default(0),
  category: z.string().optional(),
  description: z.string().optional(),
});

async function resolveShop(token: string) {
  return prisma.shop.findUnique({ where: { dashboardToken: token } });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const shop = await resolveShop(token);
  if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product", details: parsed.error.flatten() }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: { shopId: shop.id, ...parsed.data },
  });

  return NextResponse.json({ product }, { status: 201 });
}

const patchSchema = z.object({
  productId: z.string(),
  isActive: z.boolean().optional(),
  stock: z.coerce.number().int().min(0).optional(),
  price: z.coerce.number().positive().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const shop = await resolveShop(token);
  if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { productId, ...updates } = parsed.data;

  // Scope the update to this shop so one vendor's token can never touch
  // another vendor's product.
  const existing = await prisma.product.findFirst({ where: { id: productId, shopId: shop.id } });
  if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const product = await prisma.product.update({ where: { id: productId }, data: updates });
  return NextResponse.json({ product });
}
