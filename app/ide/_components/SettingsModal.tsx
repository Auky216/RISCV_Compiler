"use client";

import { useState } from "react";
import { IdeSettings } from "./types";

interface SettingsModalProps {
  settings: IdeSettings;
  onSave: (settings: IdeSettings) => void;
  onClose: () => void;
  architecture: "single_cycle" | "multi_cycle" | "pipeline";
  onArchitectureChange: (arch: "single_cycle" | "multi_cycle" | "pipeline") => void;
  isDebugging: boolean;
  isLoading: boolean;
}

export function SettingsModal({ 
  settings: initialSettings, 
  onSave, 
  onClose,
  architecture,
  onArchitectureChange,
  isDebugging,
  isLoading
}: SettingsModalProps) {
  const [settings, setSettings] = useState<IdeSettings>(initialSettings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Container with solid white background, thick blue borders, and retro shadow */}
      <div className="bg-background border-2 border-primary w-full max-w-md shadow-[6px_6px_0_var(--color-primary)] flex flex-col rounded-none relative z-50 overflow-hidden">
        {/* Header - Solid Blue with White Text */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-primary bg-primary text-white">
          <h2 className="font-pixel-title text-xs tracking-wider uppercase">CONFIGURACIÓN IDE</h2>
          <button
            onClick={onClose}
            className="text-white hover:opacity-80 transition-opacity flex items-center"
            title="Cerrar modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 bg-background text-primary">
          <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[60vh]">
            
            {/* Arquitectura del Procesador */}
            <div className="flex flex-col gap-2">
              <label className="font-pixel-title text-[10px] text-primary/70 tracking-widest uppercase">
                ARQUITECTURA DEL PROCESADOR
              </label>
              <select
                value={architecture}
                onChange={(e) => onArchitectureChange(e.target.value as any)}
                disabled={isDebugging || isLoading}
                className="bg-background border-2 border-primary text-primary px-3 py-2 font-mono text-sm outline-none focus:bg-primary/5 transition-colors disabled:opacity-50 rounded-none w-full"
              >
                <option value="single_cycle">Monociclo (Single Cycle)</option>
                <option value="multi_cycle">Multiciclo (Multi Cycle)</option>
                <option value="pipeline">Segmentado (Pipeline)</option>
              </select>
              {(isDebugging || isLoading) && (
                <p className="text-[11px] text-red-500 font-bold font-mono">
                  * Bloqueado: Finalice la depuración activa para cambiar.
                </p>
              )}
            </div>

            <div className="h-[2px] bg-primary/10" />

            {/* Límite de pasos */}
            <div className="flex flex-col gap-2">
              <label className="font-pixel-title text-[10px] text-primary/70 tracking-widest uppercase">
                LÍMITE DE PASOS DE SIMULACIÓN
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={100}
                  max={100000}
                  step={100}
                  value={settings.maxSteps}
                  onChange={(e) => setSettings({ ...settings, maxSteps: parseInt(e.target.value) || 10000 })}
                  className="bg-background border-2 border-primary text-primary px-3 py-2 font-mono text-sm w-full outline-none focus:bg-primary/5 transition-colors rounded-none"
                />
                <span className="font-mono text-xs text-primary/60 whitespace-nowrap">Max 100k</span>
              </div>
              <p className="font-mono text-[11px] text-primary/60">
                Previene bucles infinitos en ejecuciones libres.
              </p>
            </div>

            <div className="h-[2px] bg-primary/10" />

            {/* Formato de registros */}
            <div className="flex flex-col gap-2">
              <label className="font-pixel-title text-[10px] text-primary/70 tracking-widest uppercase">
                FORMATO DE REGISTROS
              </label>
              <div className="flex gap-6 mt-1 font-mono text-sm">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="displayFormat"
                    value="hex"
                    checked={settings.displayFormat === "hex"}
                    onChange={() => setSettings({ ...settings, displayFormat: "hex" })}
                    className="w-4 h-4 accent-primary"
                  />
                  Hexadecimal (0x00)
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="displayFormat"
                    value="dec"
                    checked={settings.displayFormat === "dec"}
                    onChange={() => setSettings({ ...settings, displayFormat: "dec" })}
                    className="w-4 h-4 accent-primary"
                  />
                  Decimal (123)
                </label>
              </div>
            </div>

            <div className="h-[2px] bg-primary/10" />

            {/* Ocultar registros en cero */}
            <div className="flex flex-col gap-2">
              <label className="font-pixel-title text-[10px] text-primary/70 tracking-widest uppercase">
                VISIBILIDAD DE REGISTROS
              </label>
              <label className="flex items-center gap-2 mt-1 font-mono text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.showZeroRegisters}
                  onChange={(e) => setSettings({ ...settings, showZeroRegisters: e.target.checked })}
                  className="w-4 h-4 accent-primary"
                />
                Mostrar registros con valor 0
              </label>
            </div>

            <div className="h-[2px] bg-primary/10" />

            {/* Tamaño de fuente */}
            <div className="flex flex-col gap-2">
              <label className="font-pixel-title text-[10px] text-primary/70 tracking-widest uppercase">
                TAMAÑO DE FUENTE DEL EDITOR
              </label>
              <select
                value={settings.fontSize}
                onChange={(e) => setSettings({ ...settings, fontSize: e.target.value as "sm" | "md" | "lg" })}
                className="bg-background border-2 border-primary text-primary px-3 py-2 font-mono text-sm outline-none focus:bg-primary/5 transition-colors rounded-none w-full"
              >
                <option value="sm">Pequeño</option>
                <option value="md">Mediano (Normal)</option>
                <option value="lg">Grande</option>
              </select>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t-2 border-primary bg-background flex justify-end gap-3 mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-transparent hover:border-primary text-primary font-pixel-title text-[10px] uppercase transition-all"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white border-2 border-primary font-pixel-title text-[10px] uppercase hover:bg-background hover:text-primary transition-all shadow-[2px_2px_0_var(--color-primary)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
            >
              GUARDAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
