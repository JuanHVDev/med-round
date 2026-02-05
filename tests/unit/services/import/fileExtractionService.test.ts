/**
 * Tests unitarios para el servicio de extracción de archivos
 * 
 * Verifica la detección de tipos de archivo y extracción de texto
 * para formatos CSV, PDF e imágenes
 */

import { describe, it, expect, beforeEach } from "vitest";
import { FileExtractionService } from "@/services/import/fileExtractionService";

describe("FileExtractionService", () => {
  let service: FileExtractionService;

  beforeEach(() => {
    service = new FileExtractionService();
  });

  describe("detectFileType", () => {
    it("debe detectar archivo CSV correctamente", () => {
      const file = new File([""], "pacientes.csv", { type: "text/csv" });
      const result = service.detectFileType(file);
      expect(result).toBe("csv");
    });

    it("debe detectar archivo PDF correctamente", () => {
      const file = new File([""], "pacientes.pdf", { type: "application/pdf" });
      const result = service.detectFileType(file);
      expect(result).toBe("pdf");
    });

    it("debe detectar imagen correctamente", () => {
      const file = new File([""], "pacientes.jpg", { type: "image/jpeg" });
      const result = service.detectFileType(file);
      expect(result).toBe("image");
    });

    it("debe lanzar error para tipo no soportado", () => {
      const file = new File([""], "pacientes.exe", { type: "application/exe" });
      expect(() => service.detectFileType(file)).toThrow("Tipo de archivo no soportado");
    });
  });

  describe("extractText", () => {
    it("debe extraer texto de CSV", async () => {
      const csvContent = "nombre,edad\nJuan,30\nMaria,25";
      const file = new File([csvContent], "test.csv", { type: "text/csv" });
      
      const result = await service.extractText(file);
      
      expect(result).toContain("nombre: Juan");
      expect(result).toContain("edad: 30");
    });

    it("debe retornar base64 para imágenes", async () => {
      const imageBuffer = Buffer.from("fake-image-data");
      const file = new File([imageBuffer], "test.jpg", { type: "image/jpeg" });
      
      const result = await service.extractText(file);
      
      expect(result).toBe(imageBuffer.toString("base64"));
    });
  });
});
