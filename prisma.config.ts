import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7 no longer allows a `url` in schema.prisma's datasource block.
// This file supplies the connection string for CLI commands only
// (`prisma db push`, `prisma migrate`, `prisma studio`). The app's own
// PrismaClient (src/lib/prisma.ts) and the seed script (prisma/seed.ts)
// each construct their own driver adapter directly from DATABASE_URL —
// this file doesn't affect them.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
