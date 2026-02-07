/**
 * Setup global de Vitest - Se ejecuta antes de CADA archivo de test
 *
 * Configura:
 * - Conexión a base de datos PostgreSQL
 * - Limpieza de datos de test
 *
 * Los tests usarán prisma para operaciones de base de datos.
 */

import { beforeEach, beforeAll } from "vitest";
import { prisma } from "@/lib/prisma";

beforeAll(async () => {
  try {
    await prisma.$connect();
    console.log("✅ [Test Setup] Conexión a PostgreSQL establecida");
  } catch (error) {
    console.warn("⚠️ [Test Setup] Error conectando a PostgreSQL:", error);
    throw error;
  }
});

beforeEach(async () => {
  console.log("🧹 [Test Setup] Preparando entorno de test...");

  await prisma.$transaction([
    prisma.taskChecklistItem.deleteMany(),
    prisma.task.deleteMany(),
    prisma.soapNote.deleteMany(),
    prisma.patient.deleteMany(),
    prisma.medicosProfile.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.user.deleteMany({
      where: { email: { startsWith: "test-" } },
    }),
  ]);

  console.log("✅ [Test Setup] Entorno de test preparado");
});

console.log("🚀 [Test Setup] Configuración cargada");
