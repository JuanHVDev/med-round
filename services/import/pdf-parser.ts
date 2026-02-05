/**
 * Wrapper para pdf-parse que maneja la importación correcta
 */

interface PDFParseResult {
  numpages: number;
  numrender: number;
  info: Record<string, string>;
  metadata: Record<string, string> | null;
  text: string;
}

export async function parsePDF(buffer: Buffer): Promise<string> {
  const pdfModule = await import("pdf-parse");
  const pdfParser = (pdfModule as unknown as { default: (buf: Buffer) => Promise<PDFParseResult> }).default;
  const result = await pdfParser(buffer);
  return result.text;
}
