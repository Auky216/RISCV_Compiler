// Tipos TypeScript del dominio de usuarios

export interface UserResponse {
  id: number;
  google_id: string;
  email: string;
  name: string;
  picture: string | null;
  created_at: string;
  last_login: string;
}

export interface AuthState {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
