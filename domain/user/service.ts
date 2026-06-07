import { https } from "@/domain/https";
import { UserResponse } from "./type";

export class UserService {
  /**
   * Redirige al usuario al endpoint de login con Google.
   * El backend (FastAPI) maneja el redirect a Google y el callback.
   */
  static loginWithGoogle(): void {
    window.location.href = "/api/auth/google";
  }

  /**
   * Cierra la sesión borrando la cookie en el servidor y redirige al login.
   */
  static logout(): void {
    window.location.href = "/api/auth/logout";
  }

  /**
   * Obtiene el perfil del usuario autenticado leyendo la cookie de sesión.
   * Devuelve null si no hay sesión activa (HTTP 401).
   */
  static async getMe(): Promise<UserResponse | null> {
    try {
      const response = await https.get<UserResponse>("/users/me", {
        withCredentials: true, // Envía la cookie HTTP-only
      });
      return response.data;
    } catch {
      return null; // 401 → no autenticado
    }
  }

  /**
   * Lista todos los usuarios registrados (endpoint protegido).
   */
  static async listUsers(): Promise<UserResponse[]> {
    const response = await https.get<UserResponse[]>("/users/", {
      withCredentials: true,
    });
    return response.data;
  }
}
