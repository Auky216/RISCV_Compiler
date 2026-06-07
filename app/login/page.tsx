"use client";

import { useAuth } from "@/lib/auth-context";
import { UserService } from "@/domain/user/service";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { loginWithGoogle, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/ide");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-container-lowest">
        <div className="flex gap-1 items-end">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 bg-primary rounded-full animate-bounce"
              style={{ height: 12 + i * 6, animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-surface-container-lowest">
      {/* Minimal Navbar */}
      <nav className="flex items-center justify-between px-8 h-[56px] border-b border-outline-variant">
        <a
          href="/"
          className="font-display-mono text-display-mono text-primary tracking-tighter text-[16px] hover:opacity-70 transition-opacity"
        >
          RISC-V Studio
        </a>
        <a
          href="/"
          className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver al inicio
        </a>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Card */}
          <div className="border border-outline-variant bg-surface-container p-8 flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-1 text-center">
              <div className="w-12 h-12 mx-auto flex items-center justify-center bg-primary-container/30 border border-primary/20 mb-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-primary" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" />
                  <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
                </svg>
              </div>
              <h1 className="font-display-mono text-[20px] text-on-surface tracking-tight">
                Acceder al IDE
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Inicia sesión para acceder al compilador y simulador RISC-V
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-outline-variant" />

            {/* Google Button */}
            <button
              id="btn-login-google"
              onClick={loginWithGoogle}
              className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-surface-container-lowest border border-outline hover:bg-surface-container-high active:scale-[0.98] transition-all font-body-sm text-body-sm text-on-surface group"
            >
              {/* Google SVG */}
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="flex-shrink-0">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"/>
              </svg>
              <span>Continuar con Google</span>
            </button>

            {/* Info */}
            <div className="flex flex-col gap-2">
              {[
                "Tu sesión se guarda de forma segura con JWT",
                "Solo se accede a tu nombre, email y foto de perfil",
                "Puedes cerrar sesión en cualquier momento",
              ].map((text) => (
                <div key={text} className="flex items-start gap-2">
                  <span className="mt-0.5 w-3.5 h-3.5 flex-shrink-0 text-primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant leading-relaxed">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subtle tagline */}
          <p className="text-center font-code-sm text-[11px] text-outline mt-4">
            RISC-V Studio · RV32I Assembler & Simulator
          </p>
        </div>
      </div>
    </div>
  );
}
