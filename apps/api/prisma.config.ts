import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7 moved CLI configuration out of package.json and out of the schema's
// datasource block. The URL lives here now.
//
// Note that every CLI command loads this file, not just the ones that touch the
// database — so `prisma generate` fails without a DATABASE_URL. That is the
// reason `env()` (which throws on a missing variable) is used rather than
// `process.env.DATABASE_URL` with a fallback: a missing URL should be loud.
//
// There is deliberately no `adapter` field. Migrations use the driver adapter
// automatically as of v7; `adapter` and `datasource.directUrl` were removed.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Node 24 strips TypeScript types natively, so the seed script needs no
    // tsx or ts-node dependency. SCOPE.md §11 step 1 seeds the 19 northern
    // states plus the FCT. That script does not exist yet.
    seed: "node prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
