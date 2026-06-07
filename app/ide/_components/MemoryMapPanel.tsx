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

  const isInProgram = (addr: number) => addr >= progStart && addr < progEnd;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Controls */}
      <div className="flex items-center justify-between px-panel-padding py-2 bg-surface-container border-b border-outline-variant gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">
            {model.memory.length / 1024} KB MEMORIA
          </span>
          <span className="font-code-sm text-[10px] text-primary border border-primary/30 px-1.5 py-0.5">
            .text: 0x{progStart.toString(16).padStart(8, "0").toUpperCase()}–0x{progEnd.toString(16).padStart(8, "0").toUpperCase()}
          </span>
        </div>
        <label className="flex items-center gap-1.5 cursor-pointer font-body-sm text-[11px] text-on-surface-variant">
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
              <th className="text-left pr-4 pb-1 font-label-caps text-label-caps tracking-widest opacity-70 w-24">ADDRESS</th>
              {Array.from({ length: BYTES_PER_ROW }, (_, i) => (
                <th key={i} className="w-6 text-center pb-1 font-label-caps text-label-caps opacity-50">
                  {i.toString(16).toUpperCase().padStart(2, "0")}
                </th>
              ))}
              <th className="pl-4 text-left pb-1 font-label-caps text-label-caps opacity-70">ASCII</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ address, bytes, ascii }) => {
              const inProg = isInProgram(address);
              return (
                <tr
                  key={address}
                  className={`hover:bg-surface-container-high transition-colors ${inProg ? "bg-primary-fixed/20" : ""}`}
                >
                  {/* Address */}
                  <td className="pr-4 py-0.5 text-primary font-semibold tabular-nums">
                    0x{address.toString(16).padStart(8, "0").toUpperCase()}
                  </td>

                  {/* Bytes */}
                  {bytes.map((byte, j) => {
                    const byteAddr = address + j;
                    const isCode = byteAddr >= progStart && byteAddr < progEnd;
                    return (
                      <td
                        key={j}
                        className={`w-6 text-center py-0.5 tabular-nums ${
                          byte === 0
                            ? "text-outline opacity-30"
                            : isCode
                            ? "text-primary font-bold"
                            : "text-on-surface"
                        }`}
                      >
                        {byte.toString(16).toUpperCase().padStart(2, "0")}
                      </td>
                    );
                  })}

                  {/* ASCII */}
                  <td className="pl-4 py-0.5 text-on-surface-variant tracking-wider">
                    {ascii}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination — solo si no está en modo "solo programa" */}
      {!showOnlyProgram && (
        <div className="flex items-center justify-between px-panel-padding py-2 bg-surface-container border-t border-outline-variant flex-shrink-0">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
            className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
}
