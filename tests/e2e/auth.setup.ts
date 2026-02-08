/**
 * Setup de Autenticación para Playwright Tests
 *
 * Este archivo:
 * 1. Ejecuta seeds de base de datos
 * 2. Limpia usuario de prueba existente
 * 3. Crea nuevo usuario vía Better Auth API
 * 4. Hace login y guarda estado
 *
 * Uso: Configurado en playwright.config.ts
 */

import { test as setup, expect } from "@playwright/test";
import { execSync } from "child_process";
import path from "path";

const authFile = path.join(__dirname, "../.auth/user.json");

setup.setTimeout(180000);

setup("authenticate", async ({ page }) => {
  console.log("🔧 Setup: Ejecutando seeds de base de datos...");

  // Ejecutar seeds
  try {
    execSync("npx prisma db seed", {
      stdio: "inherit",
      cwd: process.cwd(),
    });
    console.log("✅ Seeds completados");
  } catch (error) {
    console.error("❌ Error ejecutando seeds:", error);
    throw error;
  }

  console.log("🔑 Setup: Limpiando usuario existente...");
  try {
    execSync("npx tsx tests/e2e/cleanup-test-user.ts", {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (error) {
    console.log("⚠️  Error limpiando usuario:", error);
  }

  console.log("🔑 Setup: Creando nuevo usuario...");

  // Crear usuario via API
  const signUpResponse = await fetch("http://localhost:3000/api/auth/sign-up/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": "http://localhost:3000",
    },
    body: JSON.stringify({
      name: "Dr. Test User",
      email: "test@medround.com",
      password: "TestPass123!",
    }),
  });

  if (!signUpResponse.ok) {
    const errorText = await signUpResponse.text();
    throw new Error(`Error creando usuario: ${errorText}`);
  }

  console.log("✅ Usuario creado");

  // Verificar email
  console.log("🔑 Setup: Verificando email...");
  try {
    execSync("npx tsx tests/e2e/verify-test-user.ts", {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (error) {
    console.error("❌ Error verificando email:", error);
  }

  // Crear perfil de médico
  console.log("🔑 Setup: Creando perfil de médico...");
  try {
    execSync("npx tsx tests/e2e/create-medic-profile.ts", {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (error) {
    console.error("❌ Error creando perfil:", error);
  }

  console.log("🔑 Setup: Haciendo login...");

  // Navegar a login
  await page.goto("http://localhost:3000/login");
  
  // Esperar formulario
  await page.waitForSelector('input[name="email"]', { state: "visible", timeout: 10000 });
  await page.waitForSelector('input[name="password"]', { state: "visible", timeout: 10000 });

  // Llenar y enviar
  await page.fill('input[name="email"]', "test@medround.com");
  await page.fill('input[name="password"]', "TestPass123!");

  // Click y esperar navegación
  await Promise.all([
    page.waitForNavigation({ url: "**/dashboard", timeout: 60000 }),
    page.click('button[type="submit"]'),
  ]);

  // Verificar
  await expect(page).toHaveURL(/.*dashboard/);

  console.log("✅ Login exitoso");

  // Guardar estado
  await page.context().storageState({ path: authFile });
  console.log("💾 Estado guardado en:", authFile);
});
