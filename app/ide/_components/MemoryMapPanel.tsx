"use client";

import { useState } from "react";
import { RiscvModel } from "@/domain/riscv/model";

interface MemoryMapPanelProps {
  model: RiscvModel | null;
}

const BYTES_PER_ROW = 16;
const PAGE_SIZE = 64; // filas por página = 1024 bytes

export function MemoryMapPanel({ model }: MemoryMapPanelProps) {
  const [page, setPage] = useState(0);
  const [showOnlyProgram, setShowOnlyProgram] = useState(false);

  if (!model) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-6">
        <span className="material-symbols-outlined text-[36px] text-outline">memory</span>
        <p className="font-body-sm text-body-sm text-outline">
          Ejecuta un programa para inspeccionar la memoria
        </p>
      </div>
    );
  }

  const { start: progStart, end: progEnd } = model.getProgramRange();

  // Determinar rango a mostrar
  const startAddr = showOnlyProgram ? 0 : page * PAGE_SIZE * BYTES_PER_ROW;
  const length    = showOnlyProgram
    ? Math.max(progEnd + BYTES_PER_ROW, BYTES_PER_ROW)
    : PAGE_SIZE * BYTES_PER_ROW;

  const rows = model.getMemoryRows(startAddr, length, BYTES_PER_ROW);
  const totalPages = Math.ceil(model.memory.length / (PAGE_SIZE * BYTES_PER_ROW));

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-surface">
      {/* Controls */}
      <div className="flex items-center justify-between px-panel-padding py-2 bg-surface-container border-b border-outline-variant gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">
            {model.memory.length / 1024} KB MEMORIA
          </span>
          <span className="font-code-sm text-[10px] text-primary border border-primary/30 px-1.5 py-0.5 rounded-sm bg-primary/5">
            .text: 0x{progStart.toString(16).padStart(8, "0").toUpperCase()}–0x{progEnd.toString(16).padStart(8, "0").toUpperCase()}
          </span>
        </div>
        <label className="flex items-center gap-1.5 cursor-pointer font-body-sm text-[11px] text-on-surface-variant hover:text-on-surface transition-colors">
          <input
            type="checkbox"
            checked={showOnlyProgram}
            onChange={(e) => { setShowOnlyProgram(e.target.checked); setPage(0); }}
            className="w-3 h-3 accent-primary"
          />
          Solo programa
        </label>
      </div>

      {/* Hex dump table */}
      <div className="flex-1 overflow-auto p-panel-padding font-code-sm text-[11px]">
        <table className="w-full border-collapse" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <thead>
            <tr className="text-on-surface-variant">
              <th className="text-left pr-4 pb-3 font-label-caps text-label-caps tracking-widest opacity-70 w-24">ROW ADDRESS</th>
              <th className="text-left pb-3 font-label-caps text-[10px] tracking-widest opacity-70">
                <div className="flex gap-4">
                  <div className="w-[110px] text-center">WORD 0 (+0x0)</div>
                  <div className="w-[110px] text-center">WORD 1 (+0x4)</div>
                  <div className="w-[110px] text-center">WORD 2 (+0x8)</div>
                  <div className="w-[110px] text-center">WORD 3 (+0xC)</div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ address, bytes }) => {
              // Dividir los 16 bytes en 4 bloques de 4 bytes (Words)
              const words = [];
              for (let i = 0; i < 16; i += 4) {
                words.push(bytes.slice(i, i + 4));
              }

              return (
                <tr key={address} className="border-b border-outline-variant/30 group/row">
                  {/* Address Base */}
                  <td className="py-2.5 pr-4 align-middle text-primary/80 font-semibold tabular-nums text-xs group-hover/row:text-primary transition-colors">
                    0x{address.toString(16).padStart(8, "0").toUpperCase()}
                  </td>

                  {/* Words */}
                  <td className="py-2.5">
                    <div className="flex gap-4">
                      {words.map((wordBytes, wIdx) => {
                        const wordAddr = address + wIdx * 4;
                        
                        // Cálculo Little Endian
                        // JS bitwise operators actuan en 32-bit enteros con signo
                        const realValue = (wordBytes[3] << 24) | (wordBytes[2] << 16) | (wordBytes[1] << 8) | wordBytes[0];
                        // Para hexadecimal, necesitamos forzar unsigned (>>> 0)
                        const hexValue = (realValue >>> 0).toString(16).padStart(8, "0").toUpperCase();
                        
                        const isProgWord = wordAddr >= progStart && wordAddr < progEnd;
                        const isEmpty = wordBytes.every(b => b === 0);

                        return (
                          <div key={wIdx} className="relative group">
                            {/* Tooltip Interactivo */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
                              <div className="bg-[#1A1C1E] border border-outline-variant/50 rounded-lg shadow-2xl p-3 text-xs font-sans whitespace-nowrap">
                                <div className="text-on-surface-variant text-[10px] uppercase tracking-wider mb-2 font-semibold">
                                  Detalle de Palabra
                                </div>
                                <div className="flex justify-between gap-6 mb-1.5">
                                  <span className="text-outline">Dirección:</span>
                                  <span className="font-code-sm text-primary">0x{wordAddr.toString(16).padStart(8, "0").toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between gap-6 mb-1.5">
                                  <span className="text-outline">Little Endian:</span>
                                  <span className="font-code-sm text-on-surface font-bold">0x{hexValue}</span>
                                </div>
                                <div className="flex justify-between gap-6">
                                  <span className="text-outline">Decimal:</span>
                                  <span className="font-code-sm text-secondary">{(realValue >> 0).toString()}</span>
                                </div>
                              </div>
                              {/* Flecha del Tooltip */}
                              <div className="w-2 h-2 bg-[#1A1C1E] border-r border-b border-outline-variant/50 rotate-45 -mt-1.5"></div>
                            </div>

                            {/* Caja de Palabra (Word Block) */}
                            <div className={`flex justify-center items-center gap-1 w-[110px] p-1.5 rounded-md transition-all duration-200 cursor-default shadow-sm ${
                              isProgWord 
                                ? "bg-primary/10 border border-primary/30 group-hover:bg-primary/20 group-hover:border-primary/50 group-hover:-translate-y-0.5" 
                                : isEmpty 
                                  ? "bg-surface-container-high/30 border border-transparent group-hover:bg-surface-container-high group-hover:border-outline-variant/30"
                                  : "bg-surface-container-highest border border-outline-variant/40 group-hover:bg-surface-container-high group-hover:border-primary/40 group-hover:-translate-y-0.5"
                            }`}>
                              {wordBytes.map((byte, bIdx) => (
                                <span key={bIdx} className={`w-5 text-center tabular-nums transition-colors duration-200 ${
                                  byte === 0 
                                    ? "text-outline opacity-40 group-hover:opacity-70" 
                                    : isProgWord 
                                      ? "text-primary font-bold drop-shadow-[0_0_4px_rgba(var(--color-primary),0.3)]" 
                                      : "text-on-surface font-medium"
                                }`}>
                                  {byte.toString(16).toUpperCase().padStart(2, "0")}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!showOnlyProgram && (
        <div className="flex items-center justify-between px-panel-padding py-2 bg-surface-container border-t border-outline-variant flex-shrink-0">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1 font-body-sm text-[12px] text-on-surface-variant hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            Anterior
          </button>
          <span className="font-code-sm text-[10px] text-outline">
            Página {page + 1} / {totalPages} · 0x{(page * PAGE_SIZE * BYTES_PER_ROW).toString(16).toUpperCase().padStart(6, "0")}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1 font-body-sm text-[12px] text-on-surface-variant hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
}
