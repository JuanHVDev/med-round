/**
 * Wrapper para pdf-parse que maneja la importación correcta
 */

import { PDFParse } from "pdf-parse";

export async function parsePDF(buffer: Buffer): Promise<string> {
  // Usar any para evitar problemas de tipos
  const parser = PDFParse as any;
  const result = await parser(buffer);
  return result.text;
}
