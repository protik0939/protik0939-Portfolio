import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  var prismaClientSingleton: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;
  const directDatabaseUrl = process.env.DIRECT_DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  if (databaseUrl.startsWith("prisma+")) {
    return new PrismaClient({
      accelerateUrl: databaseUrl,
    });
  }

  const connectionString = directDatabaseUrl ?? databaseUrl;
  const adapter = new PrismaPg(new Pool({ connectionString }));
  return new PrismaClient({ adapter });
}

export const prisma = globalThis.prismaClientSingleton ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaClientSingleton = prisma;
}
