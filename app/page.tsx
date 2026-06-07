"use client";

import { useAuth } from "@/lib/auth-context";
import { UserService } from "@/domain/user/service";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// ── Íconos SVG inline ──────────────────────────────────────────────────────────
const IconChip = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="6" height="6" /><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" /><rect x="4" y="4" width="16" height="16" rx="2" />
  </svg>
);
const IconCpu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" />
    <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
  </svg>
);
const IconUser = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const IconGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"/>
  </svg>
);

// ── Datos de features ──────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <IconChip />,
    title: "Compilador en tiempo real",
    description:
      "Ensamblador de 2 pasadas con resolución automática de etiquetas (labels). Soporta instrucciones RV32I: tipo R, I, S, B, U y J.",
    badge: "RV32I ISA",
  },
  {
    icon: <IconCpu />,
    title: "Simulador de CPU completo",
    description:
      "32 registros (x0–x31) con nombres ABI, 1 MB de memoria virtual. Visualiza el estado exacto de cada registro tras la ejecución.",
    badge: "32 registros",
  },
  {
    icon: <IconUser />,
    title: "Tu perfil guardado",
    description:
      "Inicia sesión con Google para guardar tu perfil de forma segura. Tu historial y programas disponibles desde cualquier dispositivo.",
    badge: "Google OAuth",
  },
];

const STEPS = [
  { num: "01", title: "Escribe", desc: "Código ensamblador RISC-V en el editor integrado con numeración de líneas." },
  { num: "02", title: "Compila", desc: "Un click en Run — el ensamblador de 2 pasadas procesa tus etiquetas e instrucciones al instante." },
  { num: "03", title: "Inspecciona", desc: "Ve el valor exacto de cada uno de los 32 registros en hexadecimal y detecta qué cambió." },
];

// ── Componente Principal ────────────────────────────────────────────────────────
export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Si ya está autenticado, ofrecer ir al IDE directamente
  const handleCTA = () => {
    if (isAuthenticated) {
      router.push("/ide");
    } else {
      UserService.loginWithGoogle();
    }
  };

  const ctaLabel = isLoading
    ? "Cargando..."
    : isAuthenticated
    ? "Abrir IDE →"
    : "Empezar gratis";

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface overflow-x-hidden">
      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-[56px] bg-surface-container-lowest/80 backdrop-blur border-b border-outline-variant">
        <span className="font-display-mono text-display-mono text-primary tracking-tighter text-[18px]">
          RISC-V Studio
        </span>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => router.push("/ide")}
              className="flex items-center gap-2 px-4 py-1.5 bg-primary text-on-primary font-body-sm text-body-sm hover:opacity-80 transition-opacity"
            >
              Ir al IDE
              <IconArrow />
            </button>
          ) : (
            <>
              <a
                href="/login"
                className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors px-3 py-1.5"
              >
                Iniciar sesión
              </a>
              <button
                onClick={handleCTA}
                className="flex items-center gap-2 px-4 py-1.5 bg-primary text-on-primary font-body-sm text-body-sm hover:opacity-80 transition-opacity"
              >
                Empezar gratis
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-center pt-40 pb-32 px-6 overflow-hidden">
        {/* Glow background */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/30 bg-primary-container/20 font-code-sm text-code-sm text-primary mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          RV32I · Open Source · Sin instalación
        </div>

        {/* Title */}
        <h1 className="font-display-mono text-[52px] sm:text-[64px] leading-none tracking-tight text-on-surface mb-4">
          RISC-V
          <span
            className="block"
            style={{
              background: "linear-gradient(135deg, #00327d 0%, #2559bd 50%, #b1c5ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Studio
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-xl font-body-md text-body-md text-on-surface-variant leading-relaxed mb-10">
          El IDE web para aprender, escribir y simular arquitectura RISC-V.
          Compila código ensamblador e inspecciona el estado de la CPU
          en tiempo real, directamente en tu navegador.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            id="btn-cta-hero"
            onClick={handleCTA}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-body-md text-body-md hover:opacity-80 active:scale-95 transition-all disabled:opacity-50"
          >
            {!isAuthenticated && <IconGoogle />}
            {ctaLabel}
          </button>
          <a
            href="/ide"
            className="px-6 py-3 border border-outline-variant text-on-surface-variant font-body-md text-body-md hover:bg-surface-container-high transition-colors"
          >
            Ver el IDE
          </a>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-8 mt-14 font-code-sm text-code-sm text-on-surface-variant">
          {[
            { v: "RV32I", l: "ISA soportada" },
            { v: "32", l: "registros" },
            { v: "1 MB", l: "memoria virtual" },
            { v: "10k", l: "pasos máx." },
          ].map(({ v, l }) => (
            <div key={l} className="flex flex-col items-center gap-0.5">
              <span className="text-primary font-display-mono text-[18px]">{v}</span>
              <span className="opacity-60">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── IDE Preview ────────────────────────────────────────────────────── */}
      <section className="px-6 pb-24 flex justify-center">
        <div className="w-full max-w-4xl border border-outline-variant bg-surface-container-low overflow-hidden shadow-2xl">
          {/* Fake title bar */}
          <div className="flex items-center gap-2 px-4 h-9 bg-surface-container border-b border-outline-variant">
            <span className="w-2.5 h-2.5 rounded-full bg-error/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-primary/60" />
            <span className="ml-3 font-code-sm text-code-sm text-on-surface-variant">RISC-V Studio — main.s</span>
          </div>
          {/* Fake editor content */}
          <div className="flex" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>
            {/* Line numbers */}
            <div className="w-10 bg-surface-container text-outline text-right pr-3 py-4 select-none border-r border-outline-variant leading-6">
              {Array.from({ length: 9 }, (_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            {/* Code */}
            <pre className="flex-1 py-4 px-4 text-[12px] leading-6 text-on-surface overflow-x-auto">
              <code>
                <span className="text-outline"># RISC-V Program Entry</span>{"\n"}
                <span className="text-outline">.section .text</span>{"\n"}
                <span className="text-outline">.globl main</span>{"\n"}
                <span className="text-primary font-semibold">main:</span>{"\n"}
                {"  "}<span className="text-secondary">addi</span>{" "}<span className="text-on-surface">x1, x0, 5</span>
                <span className="text-outline">    # Load 5 into x1</span>{"\n"}
                {"  "}<span className="text-secondary">addi</span>{" "}<span className="text-on-surface">x2, x0, 10</span>
                <span className="text-outline">   # Load 10 into x2</span>{"\n"}
                {"  "}<span className="text-secondary">add</span>{"  "}<span className="text-on-surface">x3, x1, x2</span>
                <span className="text-outline">   # x3 = x1 + x2 = 15</span>{"\n"}
                <span className="text-primary font-semibold">loop:</span>{"\n"}
                {"  "}<span className="text-secondary">beq</span>{"  "}<span className="text-on-surface">x0, x0, loop</span>
              </code>
            </pre>
            {/* Registers panel */}
            <div className="w-48 border-l border-outline-variant bg-surface-container-low py-4 px-3">
              <p className="font-label-caps text-label-caps text-on-surface-variant mb-2 tracking-widest">REGISTERS</p>
              {[
                { r: "x0 (zero)", v: "0x00000000", changed: false },
                { r: "x1 (ra)", v: "0x00000005", changed: true },
                { r: "x2 (sp)", v: "0x0000000A", changed: true },
                { r: "x3 (gp)", v: "0x0000000F", changed: true },
                { r: "x4 (tp)", v: "0x00000000", changed: false },
              ].map(({ r, v, changed }) => (
                <div key={r} className={`flex justify-between py-0.5 px-1 font-code-sm text-code-sm ${changed ? "text-primary font-bold bg-primary-fixed/30" : "text-outline"}`}>
                  <span>{r.split(" ")[0]}</span>
                  <span>{v}</span>
                </div>
              ))}
              <p className="text-outline font-code-sm text-[10px] mt-2 text-center">...</p>
            </div>
          </div>
          {/* Fake console */}
          <div className="h-16 bg-[#131b2e] border-t border-white/5 px-3 py-2 font-code-sm text-code-sm">
            <span className="text-primary-fixed">[SUCCESS]</span>
            <span className="text-inverse-on-surface ml-2">Compilation finished in 42ms. 0 errors.</span>
            <br />
            <span className="text-secondary-fixed-dim">[INFO]</span>
            <span className="text-inverse-on-surface/70 ml-2">Execution completed in 3 steps.</span>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display-mono text-[28px] text-on-surface text-center mb-2">
            Todo lo que necesitas para aprender RISC-V
          </h2>
          <p className="text-on-surface-variant font-body-md text-body-md text-center mb-12">
            Sin configuración, sin instalación — funciona en el navegador.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FEATURES.map(({ icon, title, description, badge }) => (
              <div
                key={title}
                className="flex flex-col gap-4 p-6 bg-surface-container border border-outline-variant hover:border-primary/40 hover:bg-surface-container-high transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 flex items-center justify-center bg-primary-container/30 text-primary group-hover:bg-primary-container/50 transition-colors">
                    {icon}
                  </div>
                  <span className="font-code-sm text-code-sm text-primary border border-primary/30 px-2 py-0.5">
                    {badge}
                  </span>
                </div>
                <div>
                  <h3 className="font-body-md text-body-md font-semibold text-on-surface mb-2">{title}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section className="px-6 pb-24 bg-surface-container">
        <div className="max-w-3xl mx-auto py-20">
          <h2 className="font-display-mono text-[28px] text-on-surface text-center mb-12">
            Cómo funciona
          </h2>
          <div className="flex flex-col sm:flex-row items-start gap-0">
            {STEPS.map(({ num, title, desc }, i) => (
              <div key={num} className="flex-1 flex flex-col items-center text-center px-6 relative">
                {/* connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block absolute right-0 top-6 w-1/2 h-px bg-outline-variant" />
                )}
                <div className="w-12 h-12 flex items-center justify-center border border-primary text-primary font-display-mono text-[18px] bg-surface-container-lowest mb-4 z-10">
                  {num}
                </div>
                <h3 className="font-body-md text-body-md font-semibold text-on-surface mb-2">{title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ──────────────────────────────────────────────────────── */}
      <section className="px-6 py-24 flex flex-col items-center text-center">
        <div className="absolute left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-primary/8 rounded-full blur-[60px] pointer-events-none" />
        <h2 className="font-display-mono text-[32px] text-on-surface mb-4">
          Empieza a programar RISC-V hoy
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-8 max-w-md">
          Gratis, en el navegador, sin instalación.
        </p>
        <button
          id="btn-cta-final"
          onClick={handleCTA}
          disabled={isLoading}
          className="flex items-center gap-3 px-8 py-3.5 bg-primary text-on-primary font-body-md text-body-md hover:opacity-80 active:scale-95 transition-all disabled:opacity-50 shadow-lg"
        >
          {!isAuthenticated && <IconGoogle />}
          {isAuthenticated ? "Abrir IDE →" : "Continuar con Google"}
        </button>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-outline-variant px-8 py-6 flex items-center justify-between font-code-sm text-code-sm text-on-surface-variant">
        <span className="font-display-mono text-primary">RISC-V Studio</span>
        <div className="flex gap-6 opacity-60">
          <span>RV32I ISA</span>
          <span>·</span>
          <span>FastAPI + Next.js</span>
          <span>·</span>
          <span>SQLite</span>
        </div>
        <span className="opacity-40">© 2026</span>
      </footer>
    </div>
  );
}
