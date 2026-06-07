"use client";

import { useState } from "react";
import { IdeSettings } from "./types";

interface SettingsModalProps {
  settings: IdeSettings;
  onSave: (settings: IdeSettings) => void;
  onClose: () => void;
}

export function SettingsModal({ settings: initialSettings, onSave, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<IdeSettings>(initialSettings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-container-lowest border border-outline-variant w-full max-w-md shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container">
          <h2 className="font-display-mono text-[18px] text-on-surface">Configuración IDE</h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="p-6 flex flex-col gap-6 overflow-y-auto max-h-[60vh]">
            
            {/* Límite de pasos */}
            <div className="flex flex-col gap-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">
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
                  className="bg-surface-container-low border border-outline-variant px-3 py-1.5 font-code-sm text-code-sm w-full outline-none focus:border-primary transition-colors"
                />
                <span className="font-body-sm text-[11px] text-outline whitespace-nowrap">Max 100k</span>
              </div>
              <p className="font-body-sm text-[11px] text-on-surface-variant">
                Previene loops infinitos. Si el programa alcanza este límite, se detendrá automáticamente.
              </p>
            </div>

            <div className="h-px bg-outline-variant/50" />

            {/* Formato de registros */}
            <div className="flex flex-col gap-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">
                FORMATO DE REGISTROS
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 font-body-sm text-body-sm cursor-pointer">
                  <input
                    type="radio"
                    name="displayFormat"
                    value="hex"
                    checked={settings.displayFormat === "hex"}
                    onChange={() => setSettings({ ...settings, displayFormat: "hex" })}
                    className="accent-primary"
                  />
                  Hexadecimal
                </label>
                <label className="flex items-center gap-2 font-body-sm text-body-sm cursor-pointer">
                  <input
                    type="radio"
                    name="displayFormat"
                    value="dec"
                    checked={settings.displayFormat === "dec"}
                    onChange={() => setSettings({ ...settings, displayFormat: "dec" })}
                    className="accent-primary"
                  />
                  Decimal
                </label>
              </div>
            </div>

            {/* Ocultar registros en cero */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 font-body-sm text-body-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showZeroRegisters}
                  onChange={(e) => setSettings({ ...settings, showZeroRegisters: e.target.checked })}
                  className="accent-primary"
                />
                Mostrar registros con valor 0 (sin modificar)
              </label>
            </div>

            <div className="h-px bg-outline-variant/50" />

            {/* Tamaño de fuente */}
            <div className="flex flex-col gap-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">
                TAMAÑO DE FUENTE DEL EDITOR
              </label>
              <select
                value={settings.fontSize}
                onChange={(e) => setSettings({ ...settings, fontSize: e.target.value as "sm" | "md" | "lg" })}
                className="bg-surface-container-low border border-outline-variant px-3 py-1.5 font-body-sm text-body-sm outline-none focus:border-primary transition-colors"
              >
                <option value="sm">Pequeño</option>
                <option value="md">Mediano (Normal)</option>
                <option value="lg">Grande</option>
              </select>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-outline-variant bg-surface-container flex justify-end gap-3 mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-primary text-on-primary font-body-sm text-body-sm hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
