/**
 * Tests unitarios para el servicio de extracción con IA
 * 
 * Utiliza inyección de dependencias para mockear el modelo
 * de Google Generative AI
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { AIExtractionService } from "@/services/import/aiExtractionService";
import type { LanguageModel } from "ai";

// Mock de generateObject
vi.mock("ai", async () => {
  const actual = await vi.importActual("ai");
  return {
    ...actual,
    generateObject: vi.fn(),
  };
});

import { generateObject } from "ai";

describe("AIExtractionService", () => {
  let service: AIExtractionService;
  let mockModel: LanguageModel;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockModel = {
      specificationVersion: "v1",
      provider: "google",
      modelId: "gemini-1.5-flash",
      defaultObjectGenerationMode: "json",
    } as unknown as LanguageModel;

    service = new AIExtractionService(mockModel);
  });

  describe("extractFromText", () => {
    it("debe extraer pacientes de texto correctamente", async () => {
      const mockResponse = {
        object: {
          patients: [
            {
              medicalRecordNumber: "HC001",
              firstName: "Juan",
              lastName: "Pérez",
              gender: "M",
              bedNumber: "101",
              service: "Medicina",
              diagnosis: "Neumonía",
            },
          ],
        },
      };

      vi.mocked(generateObject).mockResolvedValue(mockResponse as GenerateObjectResult<unknown>);

      const result = await service.extractFromText("Paciente: Juan Pérez");

      expect(result.success).toBe(true);
      expect(result.patients).toHaveLength(1);
      expect(result.patients[0].firstName).toBe("Juan");
    });

    it("debe manejar errores del modelo", async () => {
      vi.mocked(generateObject).mockRejectedValue(new Error("API Error"));

      const result = await service.extractFromText("texto inválido");

      expect(result.success).toBe(false);
      expect(result.errors).toContain("API Error");
    });

    it("debe manejar múltiples pacientes", async () => {
      const mockResponse = {
        object: {
          patients: [
            { firstName: "Juan", lastName: "Pérez", bedNumber: "101" },
            { firstName: "Maria", lastName: "García", bedNumber: "102" },
            { firstName: "Pedro", lastName: "López", bedNumber: "103" },
          ],
        },
      };

      vi.mocked(generateObject).mockResolvedValue(mockResponse as GenerateObjectResult<unknown>);

      const result = await service.extractFromText("Lista de pacientes");

      expect(result.success).toBe(true);
      expect(result.patients).toHaveLength(3);
    });

    it("debe retornar array vacío si no hay pacientes", async () => {
      const mockResponse = {
        object: {
          patients: [],
        },
      };

      vi.mocked(generateObject).mockResolvedValue(mockResponse as GenerateObjectResult<unknown>);

      const result = await service.extractFromText("Documento vacío");

      expect(result.success).toBe(true);
      expect(result.patients).toHaveLength(0);
    });
  });

  describe("extractFromImage", () => {
    it("debe extraer pacientes de imagen base64", async () => {
      const mockResponse = {
        object: {
          patients: [
            {
              firstName: "Maria",
              lastName: "García",
              gender: "F",
              bedNumber: "205",
            },
          ],
        },
      };

      vi.mocked(generateObject).mockResolvedValue(mockResponse as GenerateObjectResult<unknown>);

      const base64Image = "fake-base64-data";
      const result = await service.extractFromImage(base64Image);

      expect(result.success).toBe(true);
      expect(result.patients).toHaveLength(1);
      expect(result.patients[0].firstName).toBe("Maria");
    });

    it("debe incluir imagen en el prompt", async () => {
      vi.mocked(generateObject).mockResolvedValue({
        object: { patients: [] },
      } as unknown);

      await service.extractFromImage("base64-data");

      const callArgs = vi.mocked(generateObject).mock.calls[0][0] as { messages: Array<{ content: Array<{ type: string }> }> };
      expect(callArgs.messages).toBeDefined();
      expect(callArgs.messages[0].content).toHaveLength(2);
      expect(callArgs.messages[0].content[1].type).toBe("image");
    });
  });

  describe("manejo de errores", () => {
    it("debe manejar respuesta nula del modelo", async () => {
      vi.mocked(generateObject).mockResolvedValue({
        object: { patients: null },
      } as unknown);

      const result = await service.extractFromText("texto");

      // Should handle gracefully
      expect(result).toBeDefined();
    });

    it("debe manejar error de red", async () => {
      vi.mocked(generateObject).mockRejectedValue(
        new Error("Network error")
      );

      const result = await service.extractFromText("texto");

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });
});
