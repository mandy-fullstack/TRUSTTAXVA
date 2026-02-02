import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
export type ExtendedPrismaClient = PrismaClient;
export { PrismaClient };
export * from "@prisma/client";
