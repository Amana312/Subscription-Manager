import path from "path";
import { PrismaClient } from "@/app/generated/prisma/client";

const dbUrl = "file:" + path.join(process.cwd(), "prisma", "dev.db");

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: dbUrl });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;