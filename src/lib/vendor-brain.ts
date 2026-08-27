import { prisma } from "@/lib/prisma";

// Every function here takes a shopId and only ever touches that shop's data.
// This is the boundary that keeps one vendor's AI from ever seeing or acting
// on another vendor's business.

export async function getBusinessSummary(shopId: string) {
  const [productCount, lowStock, orders, customerCount, openQuotations, unpaidInvoices] =
    await Promise.all([
      prisma.product.count({ where: { shopId, isActive: true } }),
      prisma.product.findMany({
        where: { shopId, isActive: true, stock: { lte: 5 } },
        select: { name: true, stock: true },
        take: 10,
      }),
      prisma.order.findMany({ where: { shopId }, select: { status: true, totalAmount: true } }),
      prisma.customer.count({ where: { shopId } }),
      prisma.quotation.count({ where: { shopId, status: "SENT" } }),
      prisma.invoice.count({ where: { shopId, status: { in: ["SENT", "DRAFT"] } } }),
    ]);

  const totalRevenue = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  return {
    productCount,
    lowStockProducts: lowStock,
    totalOrders: orders.length,
    completedOrders: orders.filter((o) => o.status === "COMPLETED").length,
    pendingOrders: orders.filter((o) => o.status === "PENDING" || o.status === "RESERVED").length,
    totalRevenue,
    customerCount,
    openQuotations,
    unpaidInvoices,
  };
}

export async function listShopProducts(shopId: string, query?: string) {
  const products = await prisma.product.findMany({
    where: {
      shopId,
      isActive: true,
      ...(query
        ? { name: { contains: query, mode: "insensitive" as const } }
        : {}),
    },
    select: { id: true, name: true, price: true, stock: true, category: true },
    take: 20,
  });
  return products.map((p) => ({ ...p, price: Number(p.price) }));
}

async function nextReference(shopId: string, prefix: "QUO" | "INV") {
  const year = new Date().getFullYear();
  const count =
    prefix === "QUO"
      ? await prisma.quotation.count({ where: { shopId } })
      : await prisma.invoice.count({ where: { shopId } });
  const seq = String(count + 1).padStart(4, "0");
  return `${prefix}-${year}-${seq}`;
}

type DocItemInput = {
  description: string;
  quantity: number;
  unitPrice?: number;
  productId?: string;
};

async function resolveItems(shopId: string, items: DocItemInput[]) {
  const resolved = [];
  for (const item of items) {
    let unitPrice = item.unitPrice;
    let productId = item.productId;

    if (unitPrice === undefined) {
      // Try to match an existing product by name so pricing is never guessed.
      const match = await prisma.product.findFirst({
        where: { shopId, name: { contains: item.description, mode: "insensitive" } },
      });
      if (match) {
        unitPrice = Number(match.price);
        productId = match.id;
      }
    }

    resolved.push({
      description: item.description,
      quantity: item.quantity,
      unitPrice: unitPrice ?? 0,
      productId,
    });
  }
  return resolved;
}

async function findOrCreateCustomer(
  shopId: string,
  customerName?: string,
  customerPhone?: string
) {
  if (!customerPhone) return undefined;
  const customer = await prisma.customer.upsert({
    where: { shopId_phone: { shopId, phone: customerPhone } },
    update: { name: customerName ?? undefined, lastSeenAt: new Date() },
    create: { shopId, phone: customerPhone, name: customerName },
  });
  return customer.id;
}

export async function createQuotation(
  shopId: string,
  args: {
    customerName?: string;
    customerPhone?: string;
    items: DocItemInput[];
    discount?: number;
    deliveryFee?: number;
    notes?: string;
  }
) {
  const items = await resolveItems(shopId, args.items);
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const discount = args.discount ?? 0;
  const deliveryFee = args.deliveryFee ?? 0;
  const total = subtotal - discount + deliveryFee;
  const customerId = await findOrCreateCustomer(shopId, args.customerName, args.customerPhone);
  const reference = await nextReference(shopId, "QUO");

  const quotation = await prisma.quotation.create({
    data: {
      shopId,
      customerId,
      reference,
      status: "DRAFT",
      subtotal,
      discount,
      deliveryFee,
      total,
      notes: args.notes,
      items: {
        create: items.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          productId: i.productId,
        })),
      },
    },
    include: { items: true },
  });

  return {
    reference: quotation.reference,
    customerName: args.customerName,
    items: items.map((i) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice })),
    subtotal,
    discount,
    deliveryFee,
    total,
  };
}

export async function createInvoice(
  shopId: string,
  args: {
    customerName?: string;
    customerPhone?: string;
    items: DocItemInput[];
    dueInDays?: number;
  }
) {
  const items = await resolveItems(shopId, args.items);
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const customerId = await findOrCreateCustomer(shopId, args.customerName, args.customerPhone);
  const reference = await nextReference(shopId, "INV");
  const dueDate = args.dueInDays
    ? new Date(Date.now() + args.dueInDays * 24 * 60 * 60 * 1000)
    : undefined;

  const invoice = await prisma.invoice.create({
    data: {
      shopId,
      customerId,
      reference,
      status: "DRAFT",
      subtotal,
      total: subtotal,
      dueDate,
      items: {
        create: items.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          productId: i.productId,
        })),
      },
    },
    include: { items: true },
  });

  return {
    reference: invoice.reference,
    customerName: args.customerName,
    items: items.map((i) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice })),
    subtotal,
    total: subtotal,
    dueDate: dueDate?.toISOString(),
  };
}
