/**
 * Script para crear una sesión manualmente para tests E2E
 * 
 * Este script crea una sesión válida en la base de datos
 * y genera el archivo de estado de autenticación para Playwright
 */

import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Creando sesión de prueba...");

  // Buscar el usuario de prueba
  const user = await prisma.user.findUnique({
    where: { email: "test@medround.com" },
  });

  if (!user) {
    throw new Error("Usuario de prueba no encontrado. Ejecuta los seeds primero.");
  }

  console.log("✅ Usuario encontrado:", user.email);

  // Crear una sesión válida
  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

  const session = await prisma.session.create({
    data: {
      id: crypto.randomUUID(),
      token: sessionToken,
      userId: user.id,
      expiresAt: expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log("✅ Sesión creada:", session.id);

  // Crear el archivo de estado de autenticación para Playwright
  const authDir = path.join(__dirname, ".auth");
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const authFile = path.join(authDir, "user.json");
  const authState = {
    cookies: [
      {
        name: "better-auth.session_token",
        value: sessionToken,
        domain: "localhost",
        path: "/",
        expires: Math.floor(expiresAt.getTime() / 1000),
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ],
    origins: [],
  };

  fs.writeFileSync(authFile, JSON.stringify(authState, null, 2));

  console.log("✅ Archivo de autenticación creado:", authFile);
  console.log("💾 Ahora puedes ejecutar los tests E2E");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
