/**
 * Script para limpiar y recrear el usuario de prueba
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Limpiando usuario de prueba existente...");

  // Buscar y eliminar usuario existente
  const existingUser = await prisma.user.findUnique({
    where: { email: "test@medround.com" },
  });

  if (existingUser) {
    // Eliminar datos relacionados
    await prisma.medicosProfile.deleteMany({
      where: { userId: existingUser.id },
    });
    await prisma.account.deleteMany({
      where: { userId: existingUser.id },
    });
    await prisma.session.deleteMany({
      where: { userId: existingUser.id },
    });
    await prisma.verification.deleteMany({
      where: { identifier: existingUser.email },
    });
    await prisma.user.delete({
      where: { id: existingUser.id },
    });
    console.log("✅ Usuario existente eliminado");
  } else {
    console.log("ℹ️  No existe usuario de prueba");
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
