import { Auth } from "@/lib/auth";

// Tipos para la sesión del cliente
interface ClientSession {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string;
  };
  session: {
    id: string;
    expiresAt: Date;
    token: string;
  };
}

// Función para obtener la sesión del cliente
export async function getClientSession(): Promise<ClientSession | null> {
  try {
    // Usar fetch para llamar a la API de autenticación
    const response = await fetch("/api/auth/session", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const session = await response.json();
    return session;
  } catch (error) {
    console.error("Error fetching client session:", error);
    return null;
  }
}

// Función para verificar si el usuario está autenticado
export async function isAuthenticated(): Promise<boolean> {
  const session = await getClientSession();
  return !!session;
}