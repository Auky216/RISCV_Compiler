"use client";

import { RiscvModel, ABI_NAMES } from "@/domain/riscv/model";

interface RegisterPanelProps {
  model: RiscvModel | null;
  displayFormat: "hex" | "dec";
  showZeroRegisters: boolean;
}

export function RegisterPanel({ model, displayFormat, showZeroRegisters }: RegisterPanelProps) {
  const getValue = (i: number) => {
    if (!model) return displayFormat === "hex" ? "0x00000000" : "0";
    return displayFormat === "hex" ? model.getHexValue(i) : model.getDecValue(i);
  };

  const isChanged = (i: number) => model?.isChanged(i) ?? false;

  const rows = ABI_NAMES.map((name, i) => ({ name, i })).filter(
    ({ i }) => showZeroRegisters || isChanged(i) || i === 0
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-background pb-10">
      {/* Format badge */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-pixel-title text-xs text-primary uppercase">
          {rows.length === 32 ? "32 REGISTROS" : `${rows.length} MODIFICADOS`}
        </span>
        <span className="font-pixel-title text-[10px] text-white bg-primary px-2 py-1 uppercase shadow-[2px_2px_0_var(--color-primary)]">
          {displayFormat.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-[2px] bg-primary border-2 border-primary p-[2px] shadow-[2px_2px_0_var(--color-primary)]">
        {/* Header */}
        <div className="bg-background p-2 text-center font-pixel-title text-[10px] text-primary uppercase font-bold">
          REG
        </div>
        <div className="bg-background p-2 text-center font-pixel-title text-[10px] text-primary uppercase font-bold">
          VALUE ({displayFormat.toUpperCase()})
        </div>

        {/* Rows */}
        {rows.map(({ name, i }) => {
          const changed = isChanged(i);
          return (
            <div key={i} className="contents">
              <div
                className={`p-2 font-mono text-sm flex justify-between items-center uppercase transition-colors duration-150 ${
                  changed 
                    ? "bg-primary text-white font-extrabold" 
                    : "bg-background text-primary"
                }`}
              >
                <span>x{i}</span>
                <span className={changed ? "text-blue-200 font-bold" : "text-primary/45"}>({name})</span>
              </div>
              <div
                className={`p-2 font-mono text-sm tabular-nums text-right font-extrabold transition-colors duration-150 ${
                  changed
                    ? "bg-primary text-white"
                    : "bg-background text-primary/80"
                }`}
              >
                {getValue(i)}
              </div>
            </div>
          );
        })}
      </div>

      {!model && (
        <p className="text-center font-pixel-title text-[10px] text-primary mt-8 uppercase border-[1px] border-primary p-4 shadow-[2px_2px_0_var(--color-primary)]">
          EJECUTA UN PROGRAMA PARA VER LOS REGISTROS
        </p>
      )}
    </div>
  );
}
