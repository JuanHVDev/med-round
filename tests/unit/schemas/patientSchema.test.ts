import { describe, it, expect } from "vitest";
import { patientSchema } from "@/lib/schemas/patientSchema";

describe("patientSchema", () =>
{
  const validData = {
    medicalRecordNumber: "HC-12345",
    firstName: "Juan",
    lastName: "Pérez",
    dateOfBirth: "1990-01-01",
    gender: "M",
    admissionDate: "2024-01-01",
    bedNumber: "101A",
    roomNumber: "101",
    service: "Medicina Interna",
    diagnosis: "Neumonía",
    hospital: "Hospital General",
    attendingDoctor: "Dr. García",
    weight: 70,
    height: 1.75,
  };

  it("debería validar datos correctos", () =>
  {
    const result = patientSchema.safeParse(validData);
    if (!result.success)
    {
      const errorMsg = result.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(", ");
      throw new Error(`Validación fallida: ${errorMsg}`);
    }
    expect(result.success).toBe(true);
  });

  it("debería fallar si faltan campos obligatorios", () =>
  {
    const invalidData = { ...validData };
    const { firstName: _unused, ...invalidDataWithoutName } = invalidData;
    const result = patientSchema.safeParse(invalidDataWithoutName);
    expect(result.success).toBe(false);
  });

  it("debería fallar si el nombre está vacío", () =>
  {
    const invalidData = { ...validData, firstName: "" };

    const result = patientSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success)
    {
      expect(result.error.issues[0].message).toBe("Nombre requerido");
    }
  });

  it("debería fallar con fechas inválidas", () =>
  {
    const invalidData = { ...validData, dateOfBirth: "fecha-invalida" };

    const result = patientSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success)
    {
      expect(result.error.issues[0].message).toBe("Fecha de nacimiento inválida");
    }
  });

  it("debería fallar con género inválido", () =>
  {
    const invalidData = { ...validData, gender: "X" };

    const result = patientSchema.safeParse(invalidData as Record<string, unknown>);
    expect(result.success).toBe(false);
  });

  it("debería permitir campos opcionales nulos", () =>
  {
    const dataWithNulls = {
      ...validData,
      roomNumber: null,
      allergies: null,
      bloodType: null,
    };

    const result = patientSchema.safeParse(dataWithNulls);
    expect(result.success).toBe(true);
  });

  it("debería validar que peso y altura sean positivos", () =>
  {
    const invalidData = { ...validData, weight: -1, height: 0 };

    const result = patientSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
