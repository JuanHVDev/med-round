/**
 * Seeds para base de datos de prueba
 *
 * Crea datos de prueba para ejecutar tests E2E:
 * - Usuario de prueba con Better Auth
 * - Perfil de médico
 * - 50 pacientes activos en el hospital INER
 *
 * Uso: npx prisma db seed
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const HOSPITAL_NAME = "INER";
const TEST_USER_EMAIL = "test@medround.com";
const TEST_USER_PASSWORD_HASH = "I9RmtYgRes2mNPkRma05Vw==:j43bO1WLj6rwfwDqrH1u4mLpYvQo1CiuHsFcyQwLa0I=";

async function main() {
  console.log("🌱 Iniciando seeds...");

  // Limpiar datos existentes (en orden inverso para respetar FKs)
  console.log("🧹 Limpiando datos existentes...");
  await prisma.handover.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.soapNote.deleteMany({});
  await prisma.patient.deleteMany({});
  // No borramos medicosProfile, account, user porque se crean vía API en auth.setup.ts

  // El usuario de prueba se crea vía API en auth.setup.ts
  // Solo creamos el perfil de médico si el usuario ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email: TEST_USER_EMAIL },
  });

  if (existingUser) {
    console.log("👤 Usuario de prueba ya existe");
    // Verificar si existe el perfil de médico
    const existingProfile = await prisma.medicosProfile.findUnique({
      where: { userId: existingUser.id },
    });

    if (!existingProfile) {
      console.log("👨‍⚕️ Creando perfil de médico...");
      await prisma.medicosProfile.create({
        data: {
          id: crypto.randomUUID(),
          userId: existingUser.id,
          fullName: "Dr. Test User",
          hospital: HOSPITAL_NAME,
          specialty: "Medicina Interna",
          userType: "Médico Residente",
          isEmailVerified: true,
        },
      });
    }
  } else {
    console.log("👤 Usuario de prueba no existe aún, se creará vía API");
  }

  // Crear 50 pacientes de prueba
  console.log("🏥 Creando 50 pacientes...");
  const firstNames = [
    "Juan", "María", "Carlos", "Ana", "Pedro", "Laura", "Miguel", "Sofía",
    "Luis", "Carmen", "José", "Isabella", "Fernando", "Valentina", "Diego",
    "Camila", "Jorge", "Daniela", "Ricardo", "Luciana", "Andrés", "Mariana",
    "Gabriel", "Victoria", "Alejandro", "Natalia", "Martín", "Paula",
    "Santiago", "Antonella", "Tomás", "Renata", "Matías", "Julieta",
    "Sebastián", "Martina", "Nicolás", "Emilia", "Lucas", "Agustina",
    "Benjamín", "Morena", "Emiliano", "Pilar", "Maximiliano", "Rocío",
    "Thiago", "Araceli", "Bruno", "Milagros"
  ];

  const lastNames = [
    "García", "Rodríguez", "López", "Martínez", "Pérez", "González", "Sánchez",
    "Ramírez", "Torres", "Flores", "Rivera", "Gómez", "Díaz", "Cruz",
    "Morales", "Reyes", "Ortiz", "Gutiérrez", "Chávez", "Ramos", "Ruiz",
    "Vargas", "Castillo", "Romero", "Moreno", "Aguilar", "Mendoza", "Herrera",
    "Medina", "Guerrero", "Vázquez", "Soto", "Contreras", "Jiménez", "Silva",
    "Rojas", "Arias", "Molina", "Castro", "Fernández", "Domínguez", "Ortega",
    "Delgado", "Vega", "Sandoval", "Carrillo", "Espinoza", "Cortés", "Santos",
    "Navarro"
  ];

  const diagnoses = [
    "Neumonía bacteriana",
    "Insuficiencia cardíaca congestiva",
    "Diabetes mellitus tipo 2",
    "EPOC exacerbado",
    "Crisis hipertensiva",
    "Síndrome coronario agudo",
    "Infección urinaria",
    "Fractura de cadera",
    "Apendicitis aguda",
    "Colecistitis aguda",
    "Pancreatitis",
    "Hemorragia digestiva",
    "Sepsis",
    "Accidente cerebrovascular",
    "Asma exacerbada",
    "Deshidratación severa",
    "Electrolitos alterados",
    "Dolor torácico no específico",
    "Cefalea intensa",
    "Síncope",
    "Celulitis",
    "Absceso cutáneo",
    "Pielonefritis",
    "Cálculos renales",
    "Vértigo",
    "Bronquitis aguda",
    "Gastroenteritis",
    "Hernia inguinal",
    "Trombosis venosa profunda",
    "Embolia pulmonar",
    "Neumotórax espontáneo",
    "Peritonitis",
    "Íleo paralítico",
    "Fístula enterocutánea",
    "Úlcera gástrica perforada",
    "Diverticulitis",
    "Enfermedad inflamatoria intestinal",
    "Cirrosis hepática",
    "Hepatitis viral",
    "Síndrome nefrótico",
    "Fallo renal agudo",
    "Anemia severa",
    "Trombocitopenia",
    "Leucemia aguda",
    "Linfoma",
    "Metástasis ósea",
    "Carcinoma de pulmón",
    "Carcinoma colorrectal",
    "Carcinoma gástrico",
    "Melanoma",
  ];

  const services = [
    "Medicina Interna",
    "Cirugía General",
    "Urgencias",
    "UCI",
    "Cardiología",
    "Neumología",
    "Gastroenterología",
    "Nefrología",
    "Hematología",
    "Oncología",
    "Neurología",
    "Traumatología",
    "Infectología",
  ];

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  for (let i = 0; i < 50; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const bedNumber = String(100 + i + 1);
    const roomNumber = i % 2 === 0 ? String(Math.floor((100 + i + 1) / 2)) : undefined;
    const diagnosis = diagnoses[i % diagnoses.length];
    const service = services[i % services.length];
    const medicalRecordNumber = `MRN${String(i + 1).padStart(5, "0")}`;
    const bloodType = bloodTypes[i % bloodTypes.length];

    // Fecha de nacimiento aleatoria entre 18 y 85 años
    const birthYear = new Date().getFullYear() - (18 + Math.floor(Math.random() * 67));
    const birthMonth = Math.floor(Math.random() * 12);
    const birthDay = Math.floor(Math.random() * 28) + 1;
    const dateOfBirth = new Date(birthYear, birthMonth, birthDay);

    // Fecha de admisión aleatoria entre 1 y 30 días atrás
    const admissionDaysAgo = Math.floor(Math.random() * 30) + 1;
    const admissionDate = new Date();
    admissionDate.setDate(admissionDate.getDate() - admissionDaysAgo);

    await prisma.patient.create({
      data: {
        id: crypto.randomUUID(),
        medicalRecordNumber,
        firstName,
        lastName,
        dateOfBirth,
        gender: i % 2 === 0 ? "Masculino" : "Femenino",
        admissionDate,
        bedNumber,
        roomNumber,
        service,
        diagnosis,
        allergies: i % 5 === 0 ? "Penicilina, Yodo" : undefined,
        isActive: true,
        hospital: HOSPITAL_NAME,
        attendingDoctor: "Dr. Test User",
        bloodType,
        emergencyContactName: `Familiar de ${firstName}`,
        emergencyContactPhone: `+52-55-${String(Math.floor(Math.random() * 89999999) + 10000000)}`,
        insuranceProvider: i % 3 === 0 ? "IMSS" : i % 3 === 1 ? "ISSSTE" : "Privado",
        insuranceNumber: `INS${String(Math.floor(Math.random() * 99999999)).padStart(8, "0")}`,
        weight: 60 + Math.random() * 40,
        height: 150 + Math.random() * 30,
        specialNotes: i % 10 === 0 ? "Requiere observación especial" : undefined,
        dietType: i % 4 === 0 ? "Blanda" : i % 4 === 1 ? "Hiposódica" : i % 4 === 2 ? "Diabética" : undefined,
        isolationPrecautions: i % 15 === 0 ? "Contacto" : i % 15 === 1 ? "Aéreo" : undefined,
      },
    });
  }

  console.log("✅ Seeds completados exitosamente!");
  console.log("📧 Usuario de prueba: test@medround.com");
  console.log("🔑 Contraseña: TestPass123!");
  console.log("🏥 Hospital: INER");
  console.log("👥 Pacientes creados: 50");
}

main()
  .catch((e) => {
    console.error("❌ Error en seeds:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
