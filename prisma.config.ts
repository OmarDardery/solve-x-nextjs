// Prisma configuration - uses environment variables directly
// In Docker: env vars come from docker-compose env_file
// On Vercel: env vars are injected by the platform
// Locally: loads from .env.local for Prisma CLI commands
import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

// Load .env.local for Prisma CLI commands (Next.js does this automatically at runtime)
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
