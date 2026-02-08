/**
 * Script para crear el perfil de médico del usuario de prueba
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "test@medround.com" },
  });

  if (!user) {
    console.log("❌ Usuario no encontrado");
    process.exit(1);
  }

  const existingProfile = await prisma.medicosProfile.findUnique({
    where: { userId: user.id },
  });

  if (!existingProfile) {
    await prisma.medicosProfile.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        fullName: "Dr. Test User",
        hospital: "INER",
        specialty: "Medicina Interna",
        userType: "Médico Residente",
        isEmailVerified: true,
      },
    });
    console.log("✅ Perfil de médico creado");
  } else {
    console.log("ℹ️  Perfil ya existe");
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
