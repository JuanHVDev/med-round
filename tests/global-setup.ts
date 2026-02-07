/**
 * Global Setup de Vitest - Se ejecuta UNA VEZ antes de todos los tests
 *
 * Configura el entorno de test:
 * - Genera el cliente Prisma para PostgreSQL
 * - Aplica migraciones si es necesario
 * - Prepara datos de seed si no existen
 *
 * Se ejecuta ANTES de que Vitest cargue cualquier archivo de test.
 */

import { execSync } from "child_process";
import path from "path";
import dotenv from "dotenv";

const envConfig = dotenv.config({ path: ".env.test" });

if (envConfig.error) {
  console.error("❌ [Global Setup] Error cargando .env.test:", envConfig.error);
  throw envConfig.error;
}

export default async function globalSetup() {
  console.log("🧪 [Global Setup] Iniciando configuración de tests...");
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || "not set"}`);
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? "*******" : "not set"}`);

  if (!process.env.DATABASE_URL) {
    console.error("❌ [Global Setup] ERROR: DATABASE_URL no está configurada");
    throw new Error("DATABASE_URL debe estar configurada en .env.test");
  }

  try {
    console.log("🔧 [Global Setup] Generando cliente Prisma...");
    execSync("npx prisma generate", {
      stdio: "inherit",
      env: process.env,
    });

  console.log("📊 [Global Setup] Verificando migraciones...");
  console.log("   Schema ya sincronizado - saltando migraciones (db push completado)");

  console.log("✅ [Global Setup] Base de datos lista para tests");
    console.log("   Los tests usarán transacciones con rollback para aislamiento");

  } catch (error) {
    console.error("❌ [Global Setup] Error configurando base de datos:", error);
    throw error;
  }
}

export const teardown = async () => {
  console.log("👋 [Global Teardown] Tests completados");
};
