/**
 * Cliente Prisma singleton para MedRound
 * 
 * Soporta múltiples entornos:
 * - Producción/Desarrollo: PostgreSQL (schema.prisma)
 * - Tests: SQLite (schema.test.prisma)
 * 
 * El cliente se conecta automáticamente a la URL configurada en DATABASE_URL.
 * Para tests, asegúrate de que DATABASE_URL apunte al archivo SQLite:
 *   DATABASE_URL="file:./medround_test.db"
 */

import { PrismaClient } from '@prisma/client'

// Singleton pattern para evitar múltiples instancias en desarrollo
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Crear cliente con configuración según el entorno
function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || ''
  const isSQLite = databaseUrl.includes('file:') || databaseUrl.includes('.db')
  
  if (isSQLite) {
    console.log('📦 [Prisma] Modo SQLite (tests)')
  } else {
    console.log('📦 [Prisma] Modo PostgreSQL (producción)')
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn']
      : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Preservar en hot reload (solo desarrollo)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
