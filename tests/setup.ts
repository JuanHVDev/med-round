/**
 * Setup global de Vitest - Se ejecuta antes de CADA archivo de test
 * 
 * Este archivo configura:
 * - Limpieza de la base de datos entre tests (tablas de medicosProfile, user, session, etc.)
 * - Mocks de variables de entorno si es necesario
 * - Estado global limpio para cada test
 * 
 * Nota: Para limpieza de BD completa antes de TODOS los tests,
 * ver tests/global-setup.ts
 */

import { beforeEach, afterAll, beforeAll } from "vitest";
import { prisma } from "@/lib/prisma";

/**
 * Limpia todas las tablas relevantes antes de cada test
 * 
 * Orden de limpieza importante por constraints de foreign keys:
 * 1. medicosProfile (depende de user)
 * 2. VerificationToken (depende de user)
 * 3. Session (depende de user)
 * 4. User (tabla base)
 * 5. Account (si existe, depende de user)
 */
beforeEach(async () =>
{
  // Limpiar en orden correcto para evitar errores de FK
  await prisma.$transaction([
    // Tablas dependientes primero (orden inverso a la jerarquía)
    prisma.taskChecklistItem.deleteMany(),
    prisma.task.deleteMany(),
    prisma.soapNote.deleteMany(),
    prisma.patient.deleteMany(),
    prisma.medicosProfile.deleteMany(),
    prisma.verification.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    // Tabla base al final
    prisma.user.deleteMany(),
  ]).catch(() =>
  {
    // Si la BD no está inicializada aún (primer test), ignorar errores
  });

  console.log("🧹 [Test Setup] Base de datos limpiada para el siguiente test");
});

/**
 * Verifica conexión a BD antes de empezar
 */
beforeAll(async () =>
{
  try
  {
    // Solo intentar conectar si parece que necesitamos la DB (opcional, pero simple)
    await prisma.$connect();
    console.log("✅ [Test Setup] Conexión a base de datos de test establecida");
    console.log(`   Database: ${process.env.DATABASE_URL}`);
  } catch (error)
  {
    console.warn("⚠️ [Test Setup] No se pudo conectar a la base de datos de test.");
    console.warn("   Si este es un test unitario, puedes ignorar este mensaje.");
    console.warn("   Error:", error instanceof Error ? error.message : error);
    // No lanzamos error para permitir que tests unitarios funcionen
  }
});

/**
 * Cierra conexión a BD después de todos los tests del archivo
 * 
 * Nota: Este hook se ejecuta para TODOS los tests. Para tests unitarios
 * que no usan Prisma, simplemente no hacemos nada.
 */
afterAll(() =>
{
  // No intentamos desconectar aquí - lo hacemos en global-teardown.ts
  // Esto evita timeouts en tests unitarios que no usan Prisma
});

/**
 * Configuración adicional de Vitest
 */
console.log("🚀 [Test Setup] Configuración de tests cargada");
