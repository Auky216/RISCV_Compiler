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
    <div className="flex-1 overflow-y-auto p-panel-padding pb-10">
      {/* Format badge */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">
          {rows.length === 32 ? "32 REGISTROS" : `${rows.length} MODIFICADOS`}
        </span>
        <span className="font-code-sm text-[10px] text-outline border border-outline-variant px-1.5 py-0.5">
          {displayFormat.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-gutter bg-outline-variant border border-outline-variant">
        {/* Header */}
        <div className="bg-surface-container-highest p-1 text-center font-label-caps text-label-caps text-on-surface-variant">
          REG
        </div>
        <div className="bg-surface-container-highest p-1 text-center font-label-caps text-label-caps text-on-surface-variant">
          VALUE ({displayFormat.toUpperCase()})
        </div>

        {/* Rows */}
        {rows.map(({ name, i }) => {
          const changed = isChanged(i);
          return (
            <div key={i} className="contents">
              <div
                className={`p-2 font-code-sm text-code-sm border-r border-outline-variant ${
                  changed ? "bg-primary-fixed text-on-surface" : "bg-surface-container-lowest text-on-surface-variant"
                }`}
              >
                x{i}{" "}
                <span className="opacity-50">({name})</span>
              </div>
              <div
                className={`p-2 font-code-sm text-code-sm tabular-nums ${
                  changed
                    ? "text-primary font-bold bg-primary-fixed"
                    : "text-outline bg-surface-container-lowest"
                }`}
              >
                {getValue(i)}
              </div>
            </div>
          );
        })}
      </div>

      {!model && (
        <p className="text-center font-body-sm text-body-sm text-outline mt-6">
          Ejecuta un programa para ver los registros
        </p>
      )}
    </div>
  );
}
