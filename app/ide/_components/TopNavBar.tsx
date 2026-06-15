"use client";

import React from "react";
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
  isDebugging: boolean;
  onDebugStart: () => void;
  onStep: () => void;
  onStop: () => void;
  onUploadBin: (file: File) => void;
  architecture: "single_cycle" | "multi_cycle" | "pipeline";
  onArchitectureChange: (arch: "single_cycle" | "multi_cycle" | "pipeline") => void;
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
  isDebugging,
  onDebugStart,
  onStep,
  onStop,
  onUploadBin,
  architecture,
  onArchitectureChange,
}: TopNavBarProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadBin(e.target.files[0]);
    }
  };
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
        <nav className="flex gap-1 relative group">
          <button className="font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high px-2 py-0.5 transition-colors">
            File
          </button>
          {/* Dropdown simple en CSS para "File" */}
          <div className="absolute top-full left-0 bg-surface-container-highest border border-outline-variant shadow-lg hidden group-hover:flex flex-col min-w-[150px] py-1 z-50">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-left px-4 py-1.5 font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            >
              Load .bin File...
            </button>
            <input 
              type="file" 
              accept=".bin" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
            />
          </div>
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

        {/* Step */}
        <button
          onClick={isDebugging ? onStep : onDebugStart}
          disabled={isLoading || (model?.isFinished && isDebugging)}
          className={`flex items-center gap-1.5 px-3 py-0.5 border font-body-sm text-body-sm transition-all ${
            isDebugging
              ? "border-primary text-primary hover:bg-primary/10"
              : "border-outline-variant text-on-surface-variant hover:border-outline"
          } ${isLoading || model?.isFinished ? "opacity-40 cursor-not-allowed" : ""}`}
          title={isDebugging ? "Paso a paso (Step)" : "Start Debug Session"}
        >
          <span className="material-symbols-outlined">step_into</span>
          <span>{isDebugging ? "Step" : "Debug"}</span>
        </button>

        {/* Stop / Pause */}
        <button
          onClick={onStop}
          className={`p-1 transition-colors ${
            isDebugging ? "text-error hover:bg-error/10" : "text-on-surface-variant opacity-40 cursor-not-allowed"
          }`}
          disabled={!isDebugging}
          title="Terminar sesión de debug"
        >
          <span className="material-symbols-outlined">stop</span>
        </button>

        <div className="h-4 w-px bg-outline-variant mx-1" />

        {/* Architecture Selector */}
        <div className="flex items-center mx-1 border border-outline-variant rounded-sm overflow-hidden bg-surface-container-low h-7">
          <select
            value={architecture}
            onChange={(e) => onArchitectureChange(e.target.value as any)}
            className="bg-transparent text-body-sm font-body-sm text-on-surface px-2 outline-none cursor-pointer h-full border-none focus:ring-0"
            disabled={isDebugging || isLoading}
            title="Seleccionar Arquitectura RISC-V"
          >
            <option value="single_cycle">Single Cycle</option>
            <option value="multi_cycle">Multi Cycle</option>
            <option value="pipeline">Pipeline</option>
          </select>
        </div>

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
