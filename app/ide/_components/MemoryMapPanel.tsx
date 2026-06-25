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
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-6 bg-background">
        <span className="material-symbols-outlined text-[36px] text-primary animate-pulse">memory</span>
        <p className="font-pixel-title text-xs text-primary uppercase border-[1px] border-primary p-4 shadow-[2px_2px_0_var(--color-primary)] bg-background">
          EJECUTA UN PROGRAMA PARA INSPECCIONAR LA MEMORIA
        </p>
      </div>
    );
  }

  const { start: progStart, end: progEnd } = model.getProgramRange();
  const pcVal = model.pc;
  const spVal = model.registers[2]; // x2 is sp

  // Determinar rango a mostrar
  const startAddr = showOnlyProgram ? 0 : page * PAGE_SIZE * BYTES_PER_ROW;
  const length    = showOnlyProgram
    ? Math.max(progEnd + BYTES_PER_ROW, BYTES_PER_ROW)
    : PAGE_SIZE * BYTES_PER_ROW;

  const rows = model.getMemoryRows(startAddr, length, BYTES_PER_ROW);
  const totalPages = Math.ceil(model.memory.length / (PAGE_SIZE * BYTES_PER_ROW));

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-background border-b-2 border-primary gap-4 flex-shrink-0 shadow-[0_2px_0_var(--color-primary)] z-10">
        <div className="flex items-center gap-4">
          <span className="font-pixel-title text-xs text-primary uppercase">
            {model.memory.length / 1024} KB MEMORIA
          </span>
          <span className="font-pixel-title text-[10px] text-white bg-primary px-2 py-1 uppercase shadow-[2px_2px_0_var(--color-primary)]">
            .text: 0x{progStart.toString(16).padStart(8, "0").toUpperCase()}–0x{progEnd.toString(16).padStart(8, "0").toUpperCase()}
          </span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer font-pixel-title text-[10px] text-primary uppercase hover:opacity-80 transition-opacity">
          <input
            type="checkbox"
            checked={showOnlyProgram}
            onChange={(e) => { setShowOnlyProgram(e.target.checked); setPage(0); }}
            className="w-4 h-4 accent-primary"
          />
          SOLO PROGRAMA
        </label>
      </div>

      {/* Hex dump table */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm bg-background">
        <table className="w-full border-collapse" style={{ fontFamily: "monospace" }}>
          <thead>
            <tr className="text-primary border-b-2 border-primary">
              <th className="text-left pr-4 py-3 font-pixel-title text-[10px] uppercase">ROW ADDRESS</th>
              <th className="text-left py-3 font-pixel-title text-[10px] uppercase">
                <div className="flex gap-4">
                  <div className="w-[110px] text-center border-b-[2px] border-primary pb-1">WORD 0 (+0x0)</div>
                  <div className="w-[110px] text-center border-b-[2px] border-primary pb-1">WORD 1 (+0x4)</div>
                  <div className="w-[110px] text-center border-b-[2px] border-primary pb-1">WORD 2 (+0x8)</div>
                  <div className="w-[110px] text-center border-b-[2px] border-primary pb-1">WORD 3 (+0xC)</div>
                </div>
              </th>
              <th className="text-left pl-6 py-3 font-pixel-title text-[10px] uppercase border-l-2 border-primary/10">ASCII TEXT</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ address, bytes, ascii }) => {
              // Dividir los 16 bytes en 4 bloques de 4 bytes (Words)
              const words = [];
              for (let i = 0; i < 16; i += 4) {
                words.push(bytes.slice(i, i + 4));
              }

              return (
                <tr key={address} className="border-b-2 border-primary/20 group/row hover:bg-primary/5">
                  {/* Address Base */}
                  <td className="py-3 pr-4 align-middle text-primary font-bold tabular-nums text-xs transition-colors">
                    0x{address.toString(16).padStart(8, "0").toUpperCase()}
                  </td>

                  {/* Words */}
                  <td className="py-3">
                    <div className="flex gap-4">
                      {words.map((wordBytes, wIdx) => {
                        const wordAddr = address + wIdx * 4;
                        
                        // Cálculo Little Endian
                        const realValue = (wordBytes[3] << 24) | (wordBytes[2] << 16) | (wordBytes[1] << 8) | wordBytes[0];
                        const hexValue = (realValue >>> 0).toString(16).padStart(8, "0").toUpperCase();
                        
                        const isProgWord = wordAddr >= progStart && wordAddr < progEnd;
                        const isEmpty = wordBytes.every(b => b === 0);
                        const isCurrentPC = pcVal !== undefined && pcVal >= wordAddr && pcVal < wordAddr + 4;
                        const isCurrentSP = spVal !== undefined && spVal >= wordAddr && spVal < wordAddr + 4;

                        return (
                          <div key={wIdx} className="relative group">
                            {/* Tooltip Interactivo */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
                              <div className="bg-background border-2 border-primary shadow-[4px_4px_0_var(--color-primary)] p-3 text-xs font-mono whitespace-nowrap uppercase">
                                <div className="text-white bg-primary font-pixel-title text-[10px] px-2 py-1 mb-3 text-center shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
                                  DETALLE DE PALABRA
                                </div>
                                <div className="flex justify-between gap-6 mb-2">
                                  <span className="text-primary opacity-70">DIRECCION:</span>
                                  <span className="font-bold text-primary">0x{wordAddr.toString(16).padStart(8, "0").toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between gap-6 mb-2">
                                  <span className="text-primary opacity-70">LITTLE ENDIAN:</span>
                                  <span className="font-bold text-primary">0x{hexValue}</span>
                                </div>
                                <div className="flex justify-between gap-6">
                                  <span className="text-primary opacity-70">DECIMAL:</span>
                                  <span className="font-bold text-primary">{(realValue >> 0).toString()}</span>
                                </div>
                              </div>
                              {/* Flecha del Tooltip */}
                              <div className="w-3 h-3 bg-background border-r-2 border-b-2 border-primary rotate-45 -mt-2"></div>
                            </div>

                            {/* Pointer Overlays */}
                            {isCurrentPC && (
                              <span className="absolute -top-2.5 -left-1.5 bg-red-500 text-white font-pixel-title text-[6px] px-1 py-0.5 border-[1px] border-white shadow-[1px_1px_0_rgba(0,0,0,0.35)] z-20 animate-pulse">
                                PC
                              </span>
                            )}
                            {isCurrentSP && (
                              <span className="absolute -top-2.5 -right-1.5 bg-yellow-400 text-primary font-pixel-title text-[6px] px-1 py-0.5 border-[1px] border-primary shadow-[1px_1px_0_rgba(0,0,0,0.35)] z-20">
                                SP
                              </span>
                            )}

                            {/* Caja de Palabra (Word Block) */}
                            <div className={`flex justify-center items-center gap-1 w-[110px] p-2 transition-all duration-200 cursor-default ${
                              isProgWord 
                                ? "bg-primary text-white shadow-[inset_0_0_8px_rgba(0,0,0,0.5)] border-[1px] border-primary group-hover:shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] group-hover:-translate-y-1" 
                                : isEmpty 
                                  ? "bg-primary/[0.02] border-[1px] border-dashed border-primary/20 text-primary/30 group-hover:border-primary/50 group-hover:bg-primary/[0.05]"
                                  : "bg-background text-primary border-[1px] border-primary group-hover:shadow-[2px_2px_0_var(--color-primary)] group-hover:-translate-y-1"
                            }`}>
                              {wordBytes.map((byte, bIdx) => (
                                <span key={bIdx} className={`w-5 text-center tabular-nums transition-colors duration-200 ${
                                  byte === 0 && !isProgWord
                                    ? "opacity-40 group-hover:opacity-80" 
                                    : "font-bold"
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

                  {/* ASCII representation */}
                  <td className="py-3 pl-6 font-mono text-xs text-primary/60 tracking-widest select-none align-middle border-l-2 border-primary/10">
                    {ascii}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!showOnlyProgram && (
        <div className="flex items-center justify-between px-4 py-3 bg-background border-t-2 border-primary flex-shrink-0 z-10 shadow-[0_-2px_0_var(--color-primary)]">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-2 font-pixel-title text-[10px] text-primary uppercase hover:bg-primary hover:text-background px-3 py-2 border-[1px] border-transparent hover:border-background disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            ANTERIOR
          </button>
          <span className="font-pixel-title text-[10px] text-white bg-primary px-3 py-1 shadow-[2px_2px_0_var(--color-primary)] uppercase">
            PAGINA {page + 1} / {totalPages} · 0x{(page * PAGE_SIZE * BYTES_PER_ROW).toString(16).toUpperCase().padStart(6, "0")}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-2 font-pixel-title text-[10px] text-primary uppercase hover:bg-primary hover:text-background px-3 py-2 border-[1px] border-transparent hover:border-background disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            SIGUIENTE
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
}
