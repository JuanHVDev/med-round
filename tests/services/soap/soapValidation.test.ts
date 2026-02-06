import { describe, it, expect } from "vitest";
import {
  vitalSignsSchema,
  soapNoteSchema,
  validateVitalSigns,
  validateSoapNote,
  isValidBloodPressure,
  formatBloodPressure,
} from "@/services/soap/soapValidation";

describe("SOAP Validation", () => {
  describe("vitalSignsSchema", () => {
    it("debería validar signs vitales vacíos como opcionales", () => {
      const result = vitalSignsSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("debería validar signs vitales válidos", () => {
      const validVitalSigns = {
        bloodPressure: "120/80",
        heartRate: 72,
        temperature: 36.5,
        respiratoryRate: 16,
        oxygenSaturation: 98,
        weight: 75.5,
        height: 1.75,
      };
      const result = vitalSignsSchema.safeParse(validVitalSigns);
      expect(result.success).toBe(true);
    });

    it("debería rechazar heartRate negativo", () => {
      const invalidVitalSigns = {
        heartRate: -10,
      };
      const result = vitalSignsSchema.safeParse(invalidVitalSigns);
      expect(result.success).toBe(false);
    });

    it("debería rechazar oxygenSaturation mayor a 100", () => {
      const invalidVitalSigns = {
        oxygenSaturation: 105,
      };
      const result = vitalSignsSchema.safeParse(invalidVitalSigns);
      expect(result.success).toBe(false);
    });

    it("debería rechazar temperature negativa", () => {
      const invalidVitalSigns = {
        temperature: -1,
      };
      const result = vitalSignsSchema.safeParse(invalidVitalSigns);
      expect(result.success).toBe(false);
    });
  });

  describe("soapNoteSchema", () => {
    it("debería validar nota SOAP con datos mínimos requeridos", () => {
      const validNote = {
        patientId: "123e4567-e89b-12d3-a456-426614174000",
        chiefComplaint: "Dolor de cabeza",
        historyOfPresentIllness: "Paciente refiere dolor de cabeza hace 3 días",
        physicalExam: "Exploración física normal",
        assessment: "Cefalea tensional",
        plan: "Analgesia y reposo",
      };
      const result = soapNoteSchema.safeParse(validNote);
      expect(result.success).toBe(true);
    });

    it("debería validar nota SOAP con signs vitales completos", () => {
      const validNoteWithVitalSigns = {
        patientId: "123e4567-e89b-12d3-a456-426614174000",
        chiefComplaint: "Dolor torácico",
        historyOfPresentIllness: "Dolor torácico opresivo",
        vitalSigns: {
          bloodPressure: "130/85",
          heartRate: 85,
          temperature: 37.2,
          respiratoryRate: 18,
          oxygenSaturation: 96,
        },
        physicalExam: "Auscardia normal",
        laboratoryResults: "CK-MB negativo",
        imagingResults: "ECG sin alteraciones",
        assessment: "Síndrome coronario agudo probable",
        plan: "Coronariografía urgente",
        medications: "Aspirina 100mg",
        pendingStudies: "Ecocardiograma",
      };
      const result = soapNoteSchema.safeParse(validNoteWithVitalSigns);
      expect(result.success).toBe(true);
    });

    it("debería rechazar patientId inválido", () => {
      const invalidNote = {
        patientId: "id-invalido",
        chiefComplaint: "Dolor",
        historyOfPresentIllness: "Historia",
        physicalExam: "Examen",
        assessment: "Eval",
        plan: "Plan",
      };
      const result = soapNoteSchema.safeParse(invalidNote);
      expect(result.success).toBe(false);
    });

    it("debería rechazar chiefComplaint vacío", () => {
      const invalidNote = {
        patientId: "123e4567-e89b-12d3-a456-426614174000",
        chiefComplaint: "",
        historyOfPresentIllness: "Historia",
        physicalExam: "Examen",
        assessment: "Eval",
        plan: "Plan",
      };
      const result = soapNoteSchema.safeParse(invalidNote);
      expect(result.success).toBe(false);
    });

    it("debería rechazar campos que exceden el límite máximo", () => {
      const invalidNote = {
        patientId: "123e4567-e89b-12d3-a456-426614174000",
        chiefComplaint: "x".repeat(501),
        historyOfPresentIllness: "Historia",
        physicalExam: "Examen",
        assessment: "Eval",
        plan: "Plan",
      };
      const result = soapNoteSchema.safeParse(invalidNote);
      expect(result.success).toBe(false);
    });
  });

  describe("validateVitalSigns", () => {
    it("debería retornar éxito con datos válidos", () => {
      const data = { heartRate: 72, bloodPressure: "120/80" };
      const result = validateVitalSigns(data);
      expect(result.success).toBe(true);
    });

    it("debería retornar error con datos inválidos", () => {
      const data = { heartRate: -5 };
      const result = validateVitalSigns(data);
      expect(result.success).toBe(false);
    });
  });

  describe("validateSoapNote", () => {
    it("debería retornar éxito con nota válida", () => {
      const data = {
        patientId: "123e4567-e89b-12d3-a456-426614174000",
        chiefComplaint: "Dolor",
        historyOfPresentIllness: "Historia",
        physicalExam: "Examen",
        assessment: "Eval",
        plan: "Plan",
      };
      const result = validateSoapNote(data);
      expect(result.success).toBe(true);
    });

    it("debería retornar error con nota inválida", () => {
      const data = {
        patientId: "invalido",
        chiefComplaint: "Dolor",
        historyOfPresentIllness: "Historia",
        physicalExam: "Examen",
        assessment: "Eval",
        plan: "Plan",
      };
      const result = validateSoapNote(data);
      expect(result.success).toBe(false);
    });
  });

  describe("isValidBloodPressure", () => {
    it("debería validar formato correcto 120/80", () => {
      expect(isValidBloodPressure("120/80")).toBe(true);
    });

    it("debería validar formato correcto 90/60", () => {
      expect(isValidBloodPressure("90/60")).toBe(true);
    });

    it("debería rechazar formato sin slash", () => {
      expect(isValidBloodPressure("12080")).toBe(false);
    });

    it("debería rechazar solo números", () => {
      expect(isValidBloodPressure("120")).toBe(false);
    });

    it("debería rechazar texto", () => {
      expect(isValidBloodPressure("alta/baja")).toBe(false);
    });
  });

  describe("formatBloodPressure", () => {
    it("debería formatear correctamente 12080 a 120/80", () => {
      expect(formatBloodPressure("12080")).toBe("120/80");
    });

    it("debería formatear correctamente 9060 a 90/60", () => {
      expect(formatBloodPressure("9060")).toBe("90/60");
    });

    it("debería manejar números cortos", () => {
      expect(formatBloodPressure("12")).toBe("12");
    });

    it("debería manejar solo el systolic", () => {
      expect(formatBloodPressure("120")).toBe("120");
    });
  });
});
