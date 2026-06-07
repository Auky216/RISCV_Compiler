"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { UserService } from "@/domain/user/service";
import { AuthState, UserResponse } from "@/domain/user/type";

// ── Context ───────────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  logout: () => void;
  loginWithGoogle: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true }));
    const user: UserResponse | null = await UserService.getMe();
    setState({
      user,
      isLoading: false,
      isAuthenticated: user !== null,
    });
  }, []);

  // Comprueba la sesión al montar la app (la cookie viaja automáticamente)
  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(() => {
    UserService.logout();
  }, []);

  const loginWithGoogle = useCallback(() => {
    UserService.loginWithGoogle();
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, logout, loginWithGoogle, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}
