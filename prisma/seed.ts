import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const building = await prisma.building.create({
    data: { name: "JKUAT Towers", address: "CBD, Nairobi" },
  });

  const floor3 = await prisma.floor.create({
    data: { buildingId: building.id, label: "Floor 3", order: 3 },
  });

  const ericPerfumes = await prisma.shop.create({
    data: {
      buildingId: building.id,
      floorId: floor3.id,
      shopNumber: "Shop 21",
      name: "Eric Fragrances",
      category: "Perfume",
      slug: "eric-fragrances",
      phone: "+254700000021",
      whatsapp: "+254700000021",
      openingHours: "Mon-Sat 8am-7pm",
      paymentMethods: ["mpesa", "cash"],
      deliveryAreas: ["Nairobi CBD", "Westlands"],
      aboutBusiness: "Premium and affordable fragrances for men and women.",
      brandVoice: "Premium but friendly",
      themeColor: "#0E8F5E", // vendor-picked teal — overrides the Vanity template's default gold accent

      products: {
        create: [
          { name: "Lattafa Asad", brand: "Lattafa", category: "Perfume", price: 2800, stock: 12, tags: ["men", "spicy", "woody"] },
          { name: "Lattafa Khamrah", brand: "Lattafa", category: "Perfume", price: 3500, stock: 8, tags: ["unisex", "sweet"] },
          { name: "Afnan 9PM", brand: "Afnan", category: "Perfume", price: 3000, stock: 5, tags: ["men", "sweet", "warm"] },
        ],
      },
    },
  });

  const janeAccessories = await prisma.shop.create({
    data: {
      buildingId: building.id,
      floorId: floor3.id,
      shopNumber: "Shop 34",
      name: "Jane Accessories",
      category: "Accessories",
      slug: "jane-accessories",
      phone: "+254700000034",
      whatsapp: "+254700000034",
      openingHours: "Mon-Sat 9am-6pm",
      paymentMethods: ["mpesa", "cash", "card"],
      products: {
        create: [
          { name: "Classic leather handbag", category: "Bags", price: 2800, stock: 4, tags: ["black", "leather"] },
          { name: "Men's steel watch", category: "Watches", price: 2000, stock: 10 },
        ],
      },
    },
  });

  await prisma.deal.create({
    data: {
      buildingId: building.id,
      shopId: ericPerfumes.id,
      title: "Buy 2 fragrances, save KSh 500",
      description: "Mix and match any two fragrances today.",
      isFeatured: true,
    },
  });

  console.log("Seeded:", { building: building.name, shops: [ericPerfumes.name, janeAccessories.name] });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
