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
  onStepBack: () => void;
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
  onStepBack,
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
    <header className="flex justify-between items-center h-14 px-4 w-full z-50 bg-background border-b-2 border-primary uppercase font-pixel-title text-primary" style={{ flexShrink: 0 }}>
      {/* Left: Logo + Menu */}
      <div className="flex items-center gap-6">
        <a
          href="/"
          className="flex items-center gap-2 hover:opacity-70 transition-opacity"
        >
          <div className="w-8 h-8 bg-primary text-white flex items-center justify-center font-bold text-lg animate-pulse">R</div>
          <span className="text-sm tracking-widest uppercase">RISC-V OS</span>
        </a>
        <nav className="flex gap-1 relative group">
          <button className="text-xs px-2 py-1 border-[1px] border-transparent hover:border-primary transition-all">
            FILE
          </button>
          {/* Dropdown simple en CSS para "File" */}
          <div className="absolute top-full left-0 bg-background border-2 border-primary shadow-[4px_4px_0_var(--color-primary)] hidden group-hover:flex flex-col min-w-[200px] p-2 z-50">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-left px-3 py-1.5 text-xs hover:bg-primary hover:text-background border-[1px] border-transparent hover:border-background transition-all"
            >
              LOAD .BIN FILE...
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
      <div className="flex items-center gap-3">
        {/* Reset */}
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-3 py-1.5 border-[1px] border-primary bg-background hover:bg-primary hover:text-background transition-all shadow-[2px_2px_0_var(--color-primary)] active:shadow-none active:translate-x-1 active:translate-y-1"
          title="Resetear estado"
        >
          <span className="material-symbols-outlined text-[18px]">replay</span>
          <span className="text-xs">RESET</span>
        </button>

        {/* Run */}
        <button
          id="btn-run"
          onClick={onRun}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-1.5 border-[1px] transition-all active:shadow-none active:translate-x-1 active:translate-y-1 ${
            isLoading
              ? "bg-green-600 text-white border-green-600 shadow-[2px_2px_0_#16a34a] animate-pulse cursor-wait"
              : "border-green-600 text-green-600 hover:bg-green-600 hover:text-white shadow-[2px_2px_0_#16a34a] bg-background"
          }`}
        >
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isLoading ? "hourglass_empty" : "play_arrow"}
          </span>
          <span className="text-xs">{isLoading ? "RUNNING..." : "RUN"}</span>
        </button>

        {/* Step Back */}
        {isDebugging && (
          <button
            onClick={onStepBack}
            disabled={isLoading || model?.stepsExecuted === 0}
            className={`flex items-center gap-2 px-3 py-1.5 border-[1px] border-primary transition-all shadow-[2px_2px_0_var(--color-primary)] active:shadow-none active:translate-x-1 active:translate-y-1 ${
              isLoading || model?.stepsExecuted === 0 
                ? "bg-background text-primary opacity-50 cursor-not-allowed" 
                : "bg-background text-primary hover:bg-primary hover:text-background"
            }`}
            title="Retroceder un paso (Step Back)"
          >
            <span className="material-symbols-outlined text-[18px]">undo</span>
            <span className="text-xs">BACK</span>
          </button>
        )}

        {/* Step */}
        <button
          onClick={isDebugging ? onStep : onDebugStart}
          disabled={isLoading || (model?.isFinished && isDebugging)}
          className={`flex items-center gap-2 px-3 py-1.5 border-[1px] border-primary transition-all shadow-[2px_2px_0_var(--color-primary)] active:shadow-none active:translate-x-1 active:translate-y-1 ${
            isDebugging
              ? isLoading || model?.isFinished
                ? "bg-background text-primary opacity-50 cursor-not-allowed"
                : "bg-primary text-white hover:bg-background hover:text-primary"
              : "bg-background text-primary hover:bg-primary hover:text-background"
          }`}
          title={isDebugging ? "Avanzar un paso (Step Forward)" : "Start Debug Session"}
        >
          <span className="material-symbols-outlined text-[18px]">{isDebugging ? "redo" : "bug_report"}</span>
          <span className="text-xs">{isDebugging ? "STEP" : "DEBUG"}</span>
        </button>

        {/* Stop / Restart */}
        {isDebugging && model?.isFinished ? (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-1.5 border-[1px] border-primary bg-background hover:bg-primary hover:text-background transition-all shadow-[2px_2px_0_var(--color-primary)] active:shadow-none active:translate-x-1 active:translate-y-1"
            title="Volver a empezar (Restart)"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            <span className="text-xs">RESTART</span>
          </button>
        ) : (
          <button
            onClick={onStop}
            className={`flex items-center gap-2 px-3 py-1.5 border-[1px] transition-all active:shadow-none active:translate-x-1 active:translate-y-1 ${
              isDebugging 
                ? "border-red-600 text-red-600 hover:bg-red-600 hover:text-white shadow-[2px_2px_0_#dc2626]" 
                : "border-red-600/30 text-red-600/30 shadow-[2px_2px_0_rgba(220,38,38,0.15)] opacity-30 cursor-not-allowed"
            }`}
            disabled={!isDebugging}
            title="Terminar sesión de debug"
          >
            <span className="material-symbols-outlined text-[18px]">stop</span>
            <span className="text-xs">STOP</span>
          </button>
        )}

        <div className="h-8 w-[4px] bg-primary mx-2" />

        {/* Architecture Selector */}
        <div className="flex items-center gap-2 px-3 py-1.5 border-[1px] border-primary bg-background shadow-[2px_2px_0_var(--color-primary)]">
          <span className="material-symbols-outlined text-[18px] text-primary">memory</span>
          <select
            value={architecture}
            onChange={(e) => onArchitectureChange(e.target.value as any)}
            className="bg-transparent text-primary font-pixel-title text-xs outline-none cursor-pointer border-none focus:ring-0 uppercase p-0"
            disabled={isDebugging || isLoading}
            title="Seleccionar Arquitectura RISC-V"
          >
            <option className="bg-background text-primary text-xs" value="single_cycle">Single Cycle</option>
            <option className="bg-background text-primary text-xs" value="multi_cycle">Multi Cycle</option>
            <option className="bg-background text-primary text-xs" value="pipeline">Pipeline</option>
          </select>
        </div>

        <div className="h-8 w-[4px] bg-primary mx-2" />

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-3 py-1.5 border-[1px] border-primary bg-background hover:bg-primary hover:text-background transition-all shadow-[2px_2px_0_var(--color-primary)] active:shadow-none active:translate-x-1 active:translate-y-1"
          title="Configuración"
        >
          <span className="material-symbols-outlined text-[18px]">settings</span>
          <span className="text-xs">SETTINGS</span>
        </button>

        {/* PC Counter */}
        <div className="flex items-center gap-2 bg-background px-3 py-1.5 border-[1px] border-primary shadow-[2px_2px_0_var(--color-primary)] ml-2">
          <span className="material-symbols-outlined text-[18px] text-primary">tag</span>
          <span className="text-xs">PC: <span className="font-mono bg-primary/20 px-1 font-bold">{pcValue}</span></span>
        </div>

        <div className="h-8 w-[4px] bg-primary mx-2" />

        {/* User */}
        {isAuthenticated && user && (
          <div className="flex items-center gap-3">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 border-[1px] border-primary shadow-[2px_2px_0_var(--color-primary)]"
                title={`${user.name} (${user.email})`}
              />
            ) : (
              <div
                className="w-8 h-8 bg-primary text-white flex items-center justify-center text-xs font-bold border-[1px] border-primary shadow-[2px_2px_0_var(--color-primary)]"
                title={`${user.name} (${user.email})`}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              id="btn-logout"
              onClick={onLogout}
              title="Cerrar sesión"
              className="flex items-center gap-2 px-3 py-1.5 border-[1px] border-primary bg-background hover:bg-primary hover:text-background transition-all shadow-[2px_2px_0_var(--color-primary)] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span className="text-xs">EXIT</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
