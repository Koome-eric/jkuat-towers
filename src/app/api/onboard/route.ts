import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { slugify, withUniqueSuffix } from "@/lib/strings";

const productSchema = z.object({
  name: z.string().min(1),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0).default(0),
  category: z.string().optional(),
});

const onboardSchema = z.object({
  businessName: z.string().min(2, "Business name is too short"),
  ownerName: z.string().optional(),
  category: z.string().min(1, "Pick a category"),
  shopNumber: z.string().min(1, "Shop number is required"),
  floorLabel: z.string().optional(),
  phone: z.string().min(7, "Enter a valid phone number"),
  whatsapp: z.string().optional(),
  openingHours: z.string().optional(),
  aboutBusiness: z.string().optional(),
  paymentMethods: z.array(z.string()).default([]),
  themeColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "themeColor must be a hex color like #3452FF")
    .optional(),
  products: z.array(productSchema).min(1, "Add at least one product"),
});

// POST /api/onboard
// Creates (or reuses) the building's floor, then creates the Shop and its
// first Products in a single transaction. This is the "5 minutes -> digital
// shop" onboarding experience from the roadmap.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in to list a shop." }, { status: 401 });
  }

  const existingShopForVendor = await prisma.shop.findUnique({ where: { clerkUserId: userId } });
  if (existingShopForVendor) {
    return NextResponse.json(
      {
        error: "You already have a shop. Manage it from your dashboard instead.",
        shop: { dashboardToken: existingShopForVendor.dashboardToken, slug: existingShopForVendor.slug },
      },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = onboardSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // MVP assumption: one active building. Once you support multiple buildings,
  // pass a buildingId/slug from the onboarding form instead.
  const building = await prisma.building.findFirst();
  if (!building) {
    return NextResponse.json(
      { error: "No building configured yet. Run the seed script or create a Building first." },
      { status: 400 }
    );
  }

  let floorId: string | undefined;
  if (data.floorLabel) {
    const floor = await prisma.floor.upsert({
      where: { buildingId_label: { buildingId: building.id, label: data.floorLabel } },
      update: {},
      create: { buildingId: building.id, label: data.floorLabel },
    });
    floorId = floor.id;
  }

  const baseSlug = slugify(data.businessName);
  const existing = await prisma.shop.findUnique({ where: { slug: baseSlug } });
  const slug = existing ? withUniqueSuffix(baseSlug) : baseSlug;

  const shop = await prisma.shop.create({
    data: {
      buildingId: building.id,
      floorId,
      name: data.businessName,
      ownerName: data.ownerName,
      category: data.category,
      shopNumber: data.shopNumber,
      slug,
      phone: data.phone,
      whatsapp: data.whatsapp || data.phone,
      openingHours: data.openingHours,
      aboutBusiness: data.aboutBusiness,
      paymentMethods: data.paymentMethods,
      themeColor: data.themeColor,
      clerkUserId: userId,
      products: {
        create: data.products.map((p) => ({
          name: p.name,
          price: p.price,
          stock: p.stock,
          category: p.category || data.category,
        })),
      },
    },
    include: { products: true },
  });

  return NextResponse.json({ shop }, { status: 201 });
}
