"use client";

import { LogEntry } from "./types";

interface ConsolePanelProps {
  logs: LogEntry[];
}

const LOG_COLORS: Record<LogEntry["type"], string> = {
  success: "text-green-400",
  error:   "text-red-400",
  info:    "text-primary",
  warn:    "text-yellow-400",
};

const LOG_BG: Record<LogEntry["type"], string> = {
  success: "",
  error:   "bg-red-400/20",
  info:    "",
  warn:    "bg-yellow-400/20",
};

export function ConsolePanel({ logs }: ConsolePanelProps) {
  return (
    <section className="h-48 bg-background text-primary border-t-2 border-primary flex flex-col z-10 pb-2 flex-shrink-0 shadow-[inset_0_4px_0_var(--color-primary)]">
      {/* Tab bar */}
      <div className="flex items-center h-10 bg-primary/10 px-4 border-b-2 border-primary justify-between flex-shrink-0">
        <div className="flex gap-4 h-full">
          <button className="font-pixel-title text-xs text-primary border-b-2 border-primary h-full pt-1">
            CONSOLE
          </button>
          <button className="font-pixel-title text-xs opacity-30 cursor-not-allowed border-b-2 border-transparent h-full pt-1" disabled>
            OUTPUT
          </button>
          <button className="font-pixel-title text-xs opacity-30 cursor-not-allowed border-b-2 border-transparent h-full pt-1" disabled>
            PROBLEMS
          </button>
        </div>
        <span className="font-pixel-title text-[10px] text-primary/50 uppercase">
          {logs.length} message{logs.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Log output */}
      <div className="flex-1 p-4 font-mono text-sm overflow-y-auto leading-relaxed uppercase">
        {logs.map((log, i) => (
          <div key={i} className={`flex gap-3 mt-1 px-2 py-1 ${LOG_BG[log.type]}`}>
            <span className={`flex-shrink-0 font-bold ${LOG_COLORS[log.type]}`}>
              [{log.type}]
            </span>
            <span className={log.type === "error" ? "text-red-400" : "text-primary"}>
              {log.message}
            </span>
            {log.timestamp && (
              <span className="ml-auto text-primary/30 text-[10px] flex-shrink-0 font-pixel-title pt-1">{log.timestamp}</span>
            )}
          </div>
        ))}

        {/* Input de debug (P1 roadmap) */}
        <div className="flex gap-2 mt-4 items-center opacity-30 px-2">
          <span className="text-primary font-bold">{`C:\\>`}</span>
          <input
            className="bg-transparent border-none p-0 w-full font-mono outline-none cursor-not-allowed text-primary uppercase"
            placeholder="DEBUGGER COMMANDS — COMING SOON..."
            type="text"
            disabled
          />
        </div>
      </div>
    </section>
  );
}
