/**
 * Script para verificar el email del usuario de prueba
 * 
 * Uso: npx tsx tests/e2e/verify-test-user.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "test@medround.com" },
  });

  if (user && !user.emailVerified) {
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });
    console.log("✅ Email verificado");
  } else if (user) {
    console.log("ℹ️  Email ya estaba verificado");
  } else {
    console.log("❌ Usuario no encontrado");
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
