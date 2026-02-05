/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PatientForm } from "@/components/patients/PatientForm";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Mock de next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}));

// Mock de sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock de fetch global
// Mock de ResizeObserver para componentes de Radix/shadcn
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.fetch = vi.fn();

describe("PatientForm Component", () =>
{
  const mockPush = vi.fn();
  const mockRefresh = vi.fn();

  beforeEach(() =>
  {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });
  });

  it("debería renderizar todos los campos básicos", () =>
  {
    render(<PatientForm />);

    // screen.debug(); // Útil para depurar
    expect(screen.getByText(/Información Personal/i)).toBeInTheDocument();
    expect(screen.getByText(/NHC/i)).toBeInTheDocument();
    expect(screen.getByText(/Nombres/i)).toBeInTheDocument();
    expect(screen.getByText(/Apellidos/i)).toBeInTheDocument();
  });

  it("debería mostrar errores de validación si se envía vacío", async () =>
  {
    render(<PatientForm />);

    const submitBtn = screen.getByRole("button", { name: /Registrar Paciente/i });
    fireEvent.click(submitBtn);

    await waitFor(() =>
    {
      expect(screen.getByText(/Número de historia clínica requerido/i)).toBeDefined();
      expect(screen.getByText(/Nombre requerido/i)).toBeDefined();
      expect(screen.getByText(/Apellido requerido/i)).toBeDefined();
    });
  });

  it("debería llamar a la API correcta al crear un paciente", async () =>
  {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ patient: { id: "123" } }),
    });

    const { container } = render(<PatientForm />);

    // Llenar campos requeridos
    fireEvent.change(screen.getByPlaceholderText(/Ej. 123456/i), { target: { value: "HC-001" } });
    fireEvent.change(screen.getByPlaceholderText(/Ej. Juan/i), { target: { value: "Juan" } });
    fireEvent.change(screen.getByPlaceholderText(/Ej. Pérez/i), { target: { value: "Perez" } });

    // El input de fecha lo buscamos por tipo ya que la etiqueta de Radix puede ser problemática en JSDOM
    const dateInput = container.querySelector('input[type="date"]');
    if (dateInput) fireEvent.change(dateInput, { target: { value: "1990-01-01" } });

    fireEvent.change(screen.getByPlaceholderText(/Ej. 302-A/i), { target: { value: "101" } });
    fireEvent.change(screen.getByPlaceholderText(/Ej. Medicina Interna/i), { target: { value: "Medicina" } });
    fireEvent.change(screen.getByPlaceholderText(/Describa el diagnóstico de ingreso/i), { target: { value: "Prueba" } });
    fireEvent.change(screen.getByPlaceholderText(/Nombre del hospital/i), { target: { value: "Hospital X" } });
    fireEvent.change(screen.getByPlaceholderText(/Ej. Dr. Mauricio Mora/i), { target: { value: "Dr. House" } });

    const submitBtn = screen.getByRole("button", { name: /Registrar Paciente/i });
    fireEvent.click(submitBtn);

    await waitFor(() =>
    {
      expect(global.fetch).toHaveBeenCalledWith("/api/patients", expect.objectContaining({
        method: "POST",
      }));
      expect(toast.success).toHaveBeenCalledWith("Paciente registrado con éxito");
      expect(mockPush).toHaveBeenCalledWith("/patients");
    });
  });
});
