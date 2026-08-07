/**
 * Switches the Prisma datasource provider between SQLite (dev) and
 * PostgreSQL (production / Neon). Run before deploying to Vercel.
 *
 *   bun run db:use-postgres   → sets provider = "postgresql"
 *   bun run db:use-sqlite     → sets provider = "sqlite"
 */
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
const target = process.argv[2] || "sqlite";
const provider = target === "postgres" ? "postgresql" : "sqlite";

let schema = readFileSync(schemaPath, "utf8");
schema = schema.replace(
  /datasource db \{[\s\S]*?provider\s*=\s*"(sqlite|postgresql)"[\s\S]*?\}/,
  (match) => match.replace(/provider\s*=\s*"(sqlite|postgresql)"/, `provider = "${provider}"`)
);
writeFileSync(schemaPath, schema);
console.log(`✓ Prisma provider set to "${provider}"`);
