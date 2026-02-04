/**
 * Servicio para extraer texto de archivos CSV, PDF e imágenes
 * 
 * Soporta:
 * - CSV: Conversión de filas a texto estructurado
 * - PDF: Extracción de texto usando pdf-parse
 * - Imágenes: Retorna base64 para procesamiento con IA
 */

import { parse } from "papaparse";
import type { FileType } from "./types";

// Importación condicional de pdf-parse para evitar problemas en tests
let pdfParseModule: typeof import("pdf-parse") | null = null;

async function getPdfParse() {
  if (!pdfParseModule) {
    pdfParseModule = await import("pdf-parse");
  }
  return pdfParseModule;
}

/**
 * Error lanzado cuando el tipo de archivo no es soportado
 */
export class UnsupportedFileTypeError extends Error {
  constructor(fileName: string) {
    super(`Tipo de archivo no soportado: ${fileName}. Use CSV, PDF o imagen.`);
    this.name = "UnsupportedFileTypeError";
  }
}

/**
 * Servicio para extraer contenido textual de archivos
 */
export class FileExtractionService {
  /**
   * Detecta el tipo de archivo basado en su MIME type y extensión
   * 
   * @param file - Archivo a analizar
   * @returns Tipo de archivo detectado
   * @throws {UnsupportedFileTypeError} Si el tipo no está soportado
   */
  detectFileType(file: File): FileType {
    const type = file.type;
    const name = file.name.toLowerCase();

    if (type === "text/csv" || name.endsWith(".csv")) {
      return "csv";
    }
    if (type === "application/pdf" || name.endsWith(".pdf")) {
      return "pdf";
    }
    if (type.startsWith("image/")) {
      return "image";
    }

    throw new UnsupportedFileTypeError(file.name);
  }

  /**
   * Extrae texto de un archivo según su tipo
   * 
   * @param file - Archivo a procesar
   * @returns Texto extraído o base64 para imágenes
   * @throws {UnsupportedFileTypeError} Si el tipo no está soportado
   */
  async extractText(file: File): Promise<string> {
    const fileType = this.detectFileType(file);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    switch (fileType) {
      case "csv":
        return this.extractFromCSV(buffer);
      case "pdf":
        return this.extractFromPDF(buffer);
      case "image":
        return buffer.toString("base64");
      default:
        throw new UnsupportedFileTypeError(file.name);
    }
  }

  /**
   * Extrae y formatea contenido de un archivo CSV
   * Convierte cada fila en texto estructurado "campo: valor"
   * 
   * @param buffer - Buffer del archivo CSV
   * @returns Texto formateado con todos los registros
   */
  private async extractFromCSV(buffer: Buffer): Promise<string> {
    const csvText = buffer.toString("utf-8");

    return new Promise((resolve, reject) => {
      parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Convertir cada fila a formato texto estructurado
          const textRepresentation = (results.data as Record<string, unknown>[])
            .map((row) =>
              Object.entries(row)
                .map(([key, value]) => `${key}: ${value}`)
                .join("\n")
            )
            .join("\n\n---PACIENTE---\n\n");

          resolve(textRepresentation);
        },
        error: (error: Error) => reject(error),
      });
    });
  }

  /**
   * Extrae texto de un archivo PDF
   * 
   * @param buffer - Buffer del archivo PDF
   * @returns Texto plano extraído
   */
  private async extractFromPDF(buffer: Buffer): Promise<string> {
    try {
      const pdfModule = await getPdfParse();
      // Usar default export o llamar directamente según la estructura del módulo
      const pdfParser = (pdfModule as any).default || pdfModule;
      const data = await pdfParser(buffer);
      return data.text;
    } catch (error) {
      throw new Error(
        `Error al procesar PDF: ${(error as Error).message}`
      );
    }
  }
}
