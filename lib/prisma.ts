/**
 * Cliente Prisma singleton para MedRound
 *
 * Usa PostgreSQL para todos los entornos (desarrollo, producción, tests).
 * La URL de conexión se configura en DATABASE_URL.
 */

import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const isTest = process.env.NODE_ENV === "test"

  if (isTest) {
    console.log("📦 [Prisma] Modo Tests (PostgreSQL)")
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
