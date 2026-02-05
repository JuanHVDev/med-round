/**
 * Global Setup de Vitest - Se ejecuta UNA VEZ antes de todos los tests
 * 
 * Este archivo configura el entorno de test completo:
 * - Genera el cliente Prisma para la BD de test
 * - Aplica migraciones de Prisma a la BD SQLite
 * - Resetea la base de datos de test
 * 
 * Se ejecuta ANTES de que Vitest cargue cualquier archivo de test.
 * 
 * @module tests/global-setup
 */

import { execSync } from "child_process";
import { existsSync, unlinkSync } from "fs";
import path from "path";
import dotenv from "dotenv";

// Cargar variables de entorno de .env.test ANTES de cualquier operación
// Esto es crítico porque el global setup corre en un proceso separado
const envConfig = dotenv.config({ path: ".env.test" });

if (envConfig.error) {
  console.error("❌ [Global Setup] Error cargando .env.test:", envConfig.error);
  throw envConfig.error;
}

/**
 * Path a la base de datos de test SQLite
 */
const TEST_DB_PATH = path.resolve(process.cwd(), "medround_test.db");

/**
 * Setup global - ejecutado una vez antes de todos los tests
 */
export default async function globalSetup() {
  console.log("🧪 [Global Setup] Iniciando configuración de tests...");
  console.log(`   Database: ${TEST_DB_PATH}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || "not set"}`);
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL || "not set"}`);
  
  // Verificar que DATABASE_URL está configurado correctamente
  if (!process.env.DATABASE_URL?.includes("medround_test.db")) {
    console.error("❌ [Global Setup] ERROR: DATABASE_URL no apunta a medround_test.db");
    console.error(`   Valor actual: ${process.env.DATABASE_URL}`);
    throw new Error("DATABASE_URL debe apuntar a medround_test.db para tests");
  }
  
  try {
    // Paso 1: Eliminar BD anterior si existe (clean slate)
    if (existsSync(TEST_DB_PATH)) {
      console.log("🗑️  [Global Setup] Eliminando BD de test anterior...");
      unlinkSync(TEST_DB_PATH);
    }
    
    // Paso 2: Generar cliente Prisma para SQLite (si es necesario)
    const PRISMA_CLIENT_PATH = path.resolve(process.cwd(), "node_modules/.prisma/client");
    const PRISMA_SCHEMA_TEST = path.resolve(process.cwd(), "prisma/schema.test.prisma");
    
    // Verificar si ya existe un cliente generado para evitar problemas de permisos en Windows
    const clientExists = existsSync(path.join(PRISMA_CLIENT_PATH, "index.js"));
    const schemaExists = existsSync(PRISMA_SCHEMA_TEST);
    
    if (!clientExists || !schemaExists) {
      console.log("🔧 [Global Setup] Generando cliente Prisma para SQLite...");
      try {
        execSync("npx prisma generate --schema=prisma/schema.test.prisma", {
          stdio: "inherit",
          env: process.env,
        });
      } catch {
        console.warn("⚠️ [Global Setup] No se pudo regenerar cliente Prisma. Usando cliente existente...");
        console.warn("   Esto puede ocurrir en Windows por bloqueos de archivos DLL.");
      }
    } else {
      console.log("✅ [Global Setup] Cliente Prisma ya existe, omitiendo regeneración");
    }
    
    // Paso 3: Aplicar migraciones a SQLite
    console.log("📊 [Global Setup] Aplicando migraciones a BD de test SQLite...");
    execSync("npx prisma migrate deploy --schema=prisma/schema.test.prisma", {
      stdio: "inherit",
      env: process.env,
    });
    
    console.log("✅ [Global Setup] Base de datos de test lista");
    
  } catch (error) {
    console.error("❌ [Global Setup] Error configurando BD de test:", error);
    throw error;
  }
}

/**
 * Teardown global - ejecutado una vez después de todos los tests (opcional)
 */
export const teardown = async () => {
  console.log("🧹 [Global Teardown] Limpiando recursos de test...");
  
  // Opcional: Eliminar archivo de BD después de tests
  // Descomentar si quieres limpieza completa
  // if (existsSync(TEST_DB_PATH)) {
  //   unlinkSync(TEST_DB_PATH);
  //   console.log('🗑️  [Global Teardown] BD de test eliminada');
  // }
  
  console.log("👋 [Global Teardown] Tests completados");
};
