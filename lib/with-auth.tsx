"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, ComponentType } from "react";

/**
 * withAuth — HOC que protege una página.
 * Si el usuario no está autenticado, redirige a /login.
 * Mientras verifica la sesión muestra un loader.
 */
export function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  return function ProtectedPage(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.replace("/login");
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-surface-container-lowest gap-4">
          <div className="flex gap-1 items-end">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 bg-primary rounded-full animate-bounce"
                style={{
                  height: 12 + i * 6,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
          <p className="font-code-sm text-code-sm text-on-surface-variant tracking-widest animate-pulse">
            VERIFICANDO SESIÓN...
          </p>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Render vacío mientras el router.replace() surte efecto
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
