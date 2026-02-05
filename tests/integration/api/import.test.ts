/**
 * Tests de integración para el endpoint de importación
 * 
 * Verifica el flujo completo: autenticación, rate limiting,
 * procesamiento de archivo y respuesta
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "@/app/api/patients/import/route";
import { NextRequest } from "next/server";

// Mocks
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(),
  getRateLimitHeaders: vi.fn(() => ({
    "X-RateLimit-Remaining": "5",
    "X-RateLimit-Reset": Date.now().toString(),
  })),
}));

vi.mock("@/services/import/fileExtractionService", () => ({
  FileExtractionService: vi.fn().mockImplementation(() => ({
    detectFileType: vi.fn((file: File) => {
      if (file.name.endsWith(".csv")) return "csv";
      if (file.name.endsWith(".pdf")) return "pdf";
      if (file.name.endsWith(".jpg")) return "image";
      throw new Error("Tipo de archivo no soportado");
    }),
    extractText: vi.fn(() => Promise.resolve("Paciente: Juan Pérez")),
  })),
}));

vi.mock("@/services/import/aiExtractionService", () => ({
  AIExtractionService: vi.fn().mockImplementation(() => ({
    extractFromText: vi.fn(() =>
      Promise.resolve({
        success: true,
        patients: [
          {
            firstName: "Juan",
            lastName: "Pérez",
            bedNumber: "101",
          },
        ],
      })
    ),
    extractFromImage: vi.fn(() =>
      Promise.resolve({
        success: true,
        patients: [
          {
            firstName: "Maria",
            lastName: "García",
            bedNumber: "102",
          },
        ],
      })
    ),
  })),
}));

import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

describe("POST /api/patients/import - Integration Tests", () => {
  const createMockRequest = (file?: File): NextRequest => {
    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }

    return new NextRequest("http://localhost:3000/api/patients/import", {
      method: "POST",
      body: formData,
    }) as NextRequest;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe rechazar solicitud sin autenticación", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const request = createMockRequest();
    const response = await POST(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("No autenticado");
  });

  it("debe aplicar rate limiting después de 5 intentos", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "test-user", email: "test@example.com" },
    });

    // Simular límite alcanzado
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 3600000,
    });

    const request = createMockRequest();
    const response = await POST(request);

    expect(response.status).toBe(429);
    const data = await response.json();
    expect(data.error).toContain("Límite");
  });

  it("debe procesar archivo CSV exitosamente", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "test-user", email: "test@example.com" },
    });

    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 4,
      resetTime: Date.now() + 3600000,
    });

    const csvFile = new File(
      ["nombre,edad\nJuan,30"],
      "pacientes.csv",
      { type: "text/csv" }
    );

    const request = createMockRequest(csvFile);
    const response = await POST(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.patients).toBeDefined();
    expect(data.count).toBe(1);
  });

  it("debe rechectar archivos no soportados", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "test-user", email: "test@example.com" },
    });

    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 4,
      resetTime: Date.now() + 3600000,
    });

    const exeFile = new File(["test"], "virus.exe", {
      type: "application/exe",
    });

    const request = createMockRequest(exeFile);
    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("no soportado");
  });

  it("debe rechazar solicitud sin archivo", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "test-user", email: "test@example.com" },
    });

    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 4,
      resetTime: Date.now() + 3600000,
    });

    const request = createMockRequest();
    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("Archivo requerido");
  });
});
