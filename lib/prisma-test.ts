/**
 * Cliente Prisma para tests (SQLite)
 * 
 * Este cliente usa el schema.test.prisma que está configurado para SQLite.
 * Se genera con: npx prisma generate --schema=prisma/schema.test.prisma
 * 
 * Nota: Este archivo es específico para tests y usa el PrismaClient
 * generado a partir del schema.test.prisma
 */

import { PrismaClient } from "@prisma/client"

// Singleton pattern para evitar múltiples instancias
const globalForTestPrisma = globalThis as unknown as {
  testPrisma: PrismaClient | undefined
}

function createTestPrismaClient(): PrismaClient {
  console.log("📦 [Prisma Test] Usando cliente SQLite para tests")
  
  return new PrismaClient({
    log: ["error"], // Solo errores en tests para menos ruido
  })
}

export const testPrisma = globalForTestPrisma.testPrisma ?? createTestPrismaClient()

// Preservar entre tests
if (process.env.NODE_ENV === "test") {
  globalForTestPrisma.testPrisma = testPrisma
}
