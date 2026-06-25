"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { withAuth } from "@/lib/with-auth";

import { RiscvService } from "@/domain/riscv/service";
import { RiscvModel } from "@/domain/riscv/model";

// Subcomponents
import { TopNavBar } from "./_components/TopNavBar";
import { SideRail } from "./_components/SideRail";
import { CodeEditor } from "./_components/CodeEditor";
import { RegisterPanel } from "./_components/RegisterPanel";
import { MemoryMapPanel } from "./_components/MemoryMapPanel";
import { DatapathPanel } from "./_components/DatapathPanel";
import { TruthTablePanel } from "./_components/TruthTablePanel";
import { ConsolePanel } from "./_components/ConsolePanel";
import { SettingsModal } from "./_components/SettingsModal";
import { IdeSettings, DEFAULT_SETTINGS, LogEntry } from "./_components/types";

function IdePage() {
  const { user, isAuthenticated, logout } = useAuth();
  
  // State: Code & CPU
  const [code, setCode] = useState(
    `# RISC-V Program Entry\n.section .text\n.globl main\nmain:\n  # Imprimir un numero en la consola (a7=1)\n  li a0, 2026\n  li a7, 1\n  ecall\n\n  # Salir del simulador (a7=10)\n  li a7, 10\n  ecall`
  );
  const [model, setModel] = useState<RiscvModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);
  const [isBinaryMode, setIsBinaryMode] = useState(false);
  
  const [logs, setLogs] = useState<LogEntry[]>([
    { type: "info", message: "RISC-V IDE Ready. Backend connected.", timestamp: new Date().toLocaleTimeString() }
  ]);
  const [architecture, setArchitecture] = useState<"single_cycle" | "multi_cycle" | "pipeline">("single_cycle");

  // State: UI & Settings
  const [activeView, setActiveView] = useState<"editor" | "datapath" | "control">("editor");
  const [activeTab, setActiveTab] = useState<"registers" | "memory">("registers");
  const [settings, setSettings] = useState<IdeSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("riscv_ide_settings");
    if (saved) {
      try { setSettings(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const handleSaveSettings = (newSettings: IdeSettings) => {
    setSettings(newSettings);
    localStorage.setItem("riscv_ide_settings", JSON.stringify(newSettings));
  };

  const addLog = (log: Omit<LogEntry, "timestamp">) => {
    setLogs(prev => [...prev, { ...log, timestamp: new Date().toLocaleTimeString() }]);
  };

  const handleRun = async () => {
    setIsLoading(true);
    addLog({ type: "info", message: `Compiling and running (max steps: ${settings.maxSteps})...` });
    
    try {
      const startTime = performance.now();
      const result = await RiscvService.runCode(code, settings.maxSteps, architecture);
      const endTime = performance.now();
      
      setModel(result);
      
      addLog({
        type: "success",
        message: `Compilation finished in ${(endTime - startTime).toFixed(0)}ms. 0 errors.`,
      });

      if (result.consoleOutput && result.consoleOutput.length > 0) {
        result.consoleOutput.forEach((out: string) => {
          addLog({ type: "info", message: `[STDOUT] ${out}` });
        });
      }
      
      if (result.hitLimit) {
        addLog({
          type: "warn",
          message: `Execution reached limit of ${settings.maxSteps} steps. (Possible infinite loop)`,
        });
      } else {
        addLog({
          type: "info",
          message: `Execution completed naturally in ${result.stepsExecuted} steps.`,
        });
      }
    } catch (error: any) {
      addLog({ type: "error", message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebugStart = async () => {
    setIsLoading(true);
    addLog({ type: "info", message: "Iniciando sesión de debug interactivo..." });
    try {
      const result = await RiscvService.startDebugSession(code, architecture);
      setModel(result);
      setIsDebugging(true);
      addLog({ type: "success", message: `Sesión de debug iniciada (ID: ${result.sessionId}).` });
      if (result.disassembly) {
        addLog({ type: "info", message: `[ASM] 0x${result.pc?.toString(16).padStart(8, '0').toUpperCase()}: ${result.disassembly}` });
      }
    } catch (error: any) {
      addLog({ type: "error", message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep = async () => {
    if (!model?.sessionId) return;
    try {
      const result = await RiscvService.stepSession(model.sessionId);
      setModel(result);

      if (result.consoleOutput && result.consoleOutput.length > 0) {
        result.consoleOutput.forEach((out: string) => {
          addLog({ type: "info", message: `[STDOUT] ${out}` });
        });
      }
      
      if (result.disassembly && !result.isFinished) {
        addLog({ type: "info", message: `[ASM] 0x${result.pc?.toString(16).padStart(8, '0').toUpperCase()}: ${result.disassembly}` });
      }

      if (result.isFinished) {
        addLog({ type: "info", message: `Programa finalizado en el paso ${result.stepsExecuted}.` });
      }
    } catch (error: any) {
      addLog({ type: "error", message: error.message });
      setIsDebugging(false);
    }
  };

  const handleStepBack = async () => {
    if (!model?.sessionId) return;
    try {
      const result = await RiscvService.stepBackSession(model.sessionId);
      setModel(result);
    } catch (error: any) {
      addLog({ type: "error", message: error.message });
    }
  };

  const handleStop = async () => {
    if (model?.sessionId) {
      await RiscvService.stopSession(model.sessionId);
    }
    setIsDebugging(false);
    addLog({ type: "info", message: "Sesión de debug terminada." });
  };

  const handleUploadBin = async (file: File) => {
    setIsLoading(true);
    addLog({ type: "info", message: `Cargando archivo binario: ${file.name}...` });
    try {
      const result = await RiscvService.uploadBinFile(file, architecture);
      setModel(result);
      setIsBinaryMode(true);
      setIsDebugging(true);
      addLog({ type: "success", message: `Binario cargado. Listo para debug.` });
    } catch (error: any) {
      addLog({ type: "error", message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (model?.sessionId) {
      await RiscvService.stopSession(model.sessionId);
    }
    setModel(null);
    setIsDebugging(false);
    setIsBinaryMode(false);
    addLog({ type: "info", message: "CPU state reset. Memory and registers cleared." });
  };

  return (
    // h-screen + overflow-hidden = NOTHING scrolls at page level. Everything is contained.
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
      className="font-mono text-primary bg-background selection:bg-primary selection:text-background">

      {/* TOP NAV - fixed height */}
      <div style={{ flexShrink: 0 }}>
        <TopNavBar
          user={user}
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          model={model}
          onRun={handleRun}
          onReset={handleReset}
          onLogout={logout}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isDebugging={isDebugging}
          onDebugStart={handleDebugStart}
          onStep={handleStep}
          onStepBack={handleStepBack}
          onStop={handleStop}
          onUploadBin={handleUploadBin}
          architecture={architecture}
          onArchitectureChange={setArchitecture}
        />
      </div>

      {/* BODY: SideRail + Content — takes all remaining height */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

        {/* SIDE RAIL */}
        <SideRail activeView={activeView} onViewChange={setActiveView} />

        {/* CENTER: panels stacked vertically */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>

          {/* MAIN PANELS ROW */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

            {activeView === "editor" && (
              <>
                {/* CODE EDITOR */}
                <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
                  <CodeEditor
                    code={code}
                    onChange={setCode}
                    fontSize={settings.fontSize}
                    isBinaryMode={isBinaryMode}
                    currentLine={model?.currentLine}
                  />
                </div>

                {/* RIGHT PANEL: Registers / Memory */}
                <div style={{ width: "38%", display: "flex", flexDirection: "column", overflow: "hidden", borderLeft: "2px solid var(--color-primary)" }}>
                  {/* Tab bar */}
                  <div style={{ display: "flex", flexShrink: 0, background: "var(--color-primary)" }}>
                    {(["registers", "memory"] as const).map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)}
                        style={{
                          flex: 1, padding: "8px 4px", fontSize: 11, fontWeight: "bold",
                          textTransform: "uppercase", letterSpacing: 1, cursor: "pointer",
                          background: activeTab === tab ? "#fff" : "transparent",
                          color: activeTab === tab ? "var(--color-primary)" : "#fff",
                          border: "none", borderRight: tab === "registers" ? "1px solid rgba(255,255,255,0.3)" : "none",
                        }}>
                        {tab === "registers" ? "Registers" : "Memory"}
                      </button>
                    ))}
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, overflow: "hidden", position: "relative", minHeight: 0 }}>
                    {activeTab === "registers" && (
                      <div style={{ position: "absolute", inset: 0, overflowY: "auto" }}>
                        <RegisterPanel model={model} displayFormat={settings.displayFormat} showZeroRegisters={settings.showZeroRegisters} />
                      </div>
                    )}
                    {activeTab === "memory" && (
                      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
                        <MemoryMapPanel model={model} />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeView === "datapath" && (
              <div style={{ flex: 1, overflow: "hidden" }}>
                <DatapathPanel model={model} />
              </div>
            )}

            {activeView === "control" && (
              <div style={{ flex: 1, overflow: "hidden" }}>
                <TruthTablePanel model={model} />
              </div>
            )}
          </div>

          {/* CONSOLE - fixed height at bottom */}
          <div style={{ flexShrink: 0 }}>
            <ConsolePanel logs={logs} />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ flexShrink: 0 }} className="flex justify-between items-center px-4 h-8 bg-background border-t-2 border-primary font-pixel-title text-[10px] text-primary uppercase">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 ${isLoading ? "bg-yellow-400 animate-pulse" : "bg-primary"}`} />
            {isLoading ? "RUNNING..." : "SYSTEM READY"}
          </span>
          <span className="opacity-50">|</span>
          <span>RISC-V OS V2.0</span>
          {model && (
            <>
              <span className="opacity-50">|</span>
              <span className="font-bold">{model.stepsExecuted} STEPS</span>
            </>
          )}
        </div>
        <div className="flex gap-6">
          <a className="opacity-50 hover:opacity-100" href="#">[DOCS]</a>
          <a className="opacity-50 hover:opacity-100" href="#">[BUG_REPORT]</a>
        </div>
      </div>

      {isSettingsOpen && (
        <SettingsModal settings={settings} onSave={handleSaveSettings} onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  );
}

export default withAuth(IdePage);
