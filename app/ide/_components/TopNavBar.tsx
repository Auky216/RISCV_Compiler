"use client";

import { UserResponse } from "@/domain/user/type";
import { RiscvModel } from "@/domain/riscv/model";

interface TopNavBarProps {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  model: RiscvModel | null;
  onRun: () => void;
  onReset: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
}

export function TopNavBar({
  user,
  isAuthenticated,
  isLoading,
  model,
  onRun,
  onReset,
  onLogout,
  onOpenSettings,
}: TopNavBarProps) {
  const pcValue = model
    ? "0x" + (model.stepsExecuted * 4).toString(16).padStart(8, "0").toUpperCase()
    : "0x00000000";

  return (
    <header className="flex justify-between items-center h-toolbar-height px-panel-padding w-full z-50 bg-surface-container-lowest border-b border-outline-variant fixed top-0 no-shadow">
      {/* Left: Logo + Menu */}
      <div className="flex items-center gap-6">
        <a
          href="/"
          className="font-display-mono text-display-mono text-primary tracking-tighter text-[16px] hover:opacity-70 transition-opacity"
        >
          RISC-V Studio
        </a>
        <nav className="flex gap-1">
          {["File", "Edit", "Build", "Debug"].map((item) => (
            <button
              key={item}
              className="font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high px-2 py-0.5 transition-colors"
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      {/* Center: Actions */}
      <div className="flex items-center gap-2">
        {/* Reset */}
        <button
          onClick={onReset}
          className="p-1 text-on-surface-variant hover:bg-surface-container-high transition-colors"
          title="Resetear estado"
        >
          <span className="material-symbols-outlined">replay</span>
        </button>

        {/* Run */}
        <button
          id="btn-run"
          onClick={onRun}
          disabled={isLoading}
          className={`flex items-center gap-1.5 px-3 py-0.5 font-body-sm text-body-sm hover:opacity-80 transition-all ${
            isLoading
              ? "bg-outline text-surface cursor-wait"
              : "bg-primary-container text-on-primary-container"
          }`}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isLoading ? "hourglass_empty" : "play_arrow"}
          </span>
          <span>{isLoading ? "Running..." : "Run"}</span>
        </button>

        {/* Step — P1 roadmap */}
        <button
          className="flex items-center gap-1.5 px-3 py-0.5 border border-outline-variant text-on-surface-variant font-body-sm text-body-sm opacity-40 cursor-not-allowed"
          disabled
          title="Step debugger — próximamente"
        >
          <span className="material-symbols-outlined">step_into</span>
          <span>Step</span>
        </button>

        <button
          className="p-1 text-on-surface-variant opacity-40 cursor-not-allowed"
          disabled
          title="Pause — próximamente"
        >
          <span className="material-symbols-outlined">pause</span>
        </button>

        <div className="h-4 w-px bg-outline-variant mx-1" />

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1 text-on-surface-variant hover:bg-surface-container-high transition-colors"
          title="Configuración"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>

        {/* PC Counter */}
        <div className="flex items-center bg-surface-container-low px-3 h-7 border border-outline-variant ml-1">
          <span className="font-code-sm text-code-sm text-primary">PC: {pcValue}</span>
        </div>

        <div className="h-4 w-px bg-outline-variant mx-1" />

        {/* User */}
        {isAuthenticated && user && (
          <div className="flex items-center gap-2">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-6 h-6 rounded-full border border-outline-variant"
                title={`${user.name} (${user.email})`}
              />
            ) : (
              <div
                className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[10px] font-bold"
                title={`${user.name} (${user.email})`}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-body-sm text-body-sm text-on-surface-variant hidden sm:inline">
              {user.name.split(" ")[0]}
            </span>
            <button
              id="btn-logout"
              onClick={onLogout}
              title="Cerrar sesión"
              className="p-1 text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
