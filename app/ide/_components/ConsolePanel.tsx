"use client";

import { LogEntry } from "./types";

interface ConsolePanelProps {
  logs: LogEntry[];
}

const LOG_COLORS: Record<LogEntry["type"], string> = {
  success: "text-primary-fixed",
  error:   "text-error",
  info:    "text-secondary-fixed-dim",
  warn:    "text-yellow-400",
};

const LOG_BG: Record<LogEntry["type"], string> = {
  success: "",
  error:   "bg-error/5",
  info:    "",
  warn:    "bg-yellow-400/5",
};

export function ConsolePanel({ logs }: ConsolePanelProps) {
  return (
    <section className="h-48 bg-inverse-surface text-inverse-on-surface border-t border-outline-variant flex flex-col z-10 pb-10 flex-shrink-0">
      {/* Tab bar */}
      <div className="flex items-center h-8 bg-[#131b2e] px-3 border-b border-white/5 justify-between flex-shrink-0">
        <div className="flex gap-4">
          <button className="font-label-caps text-label-caps text-primary-fixed border-b border-primary-fixed pb-0.5">
            CONSOLE
          </button>
          <button className="font-label-caps text-label-caps opacity-30 cursor-not-allowed" disabled>
            OUTPUT
          </button>
          <button className="font-label-caps text-label-caps opacity-30 cursor-not-allowed" disabled>
            PROBLEMS
          </button>
        </div>
        <span className="font-code-sm text-[10px] text-white/30">
          {logs.length} message{logs.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Log output */}
      <div className="flex-1 p-3 font-code-sm text-code-sm overflow-y-auto leading-relaxed">
        {logs.map((log, i) => (
          <div key={i} className={`flex gap-2 mt-0.5 px-1 py-0.5 ${LOG_BG[log.type]}`}>
            <span className={`flex-shrink-0 font-bold ${LOG_COLORS[log.type]}`}>
              [{log.type.toUpperCase()}]
            </span>
            <span className={log.type === "error" ? "text-error" : "text-inverse-on-surface"}>
              {log.message}
            </span>
            {log.timestamp && (
              <span className="ml-auto text-white/20 text-[10px] flex-shrink-0">{log.timestamp}</span>
            )}
          </div>
        ))}

        {/* Input de debug (P1 roadmap) */}
        <div className="flex gap-2 mt-2 items-center opacity-30">
          <span className="text-primary-fixed-dim">{"> "}</span>
          <input
            className="bg-transparent border-none p-0 w-full font-code-sm outline-none cursor-not-allowed"
            placeholder="Debugger commands — próximamente..."
            type="text"
            disabled
          />
        </div>
      </div>
    </section>
  );
}
