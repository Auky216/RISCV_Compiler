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
import { ConsolePanel } from "./_components/ConsolePanel";
import { SettingsModal } from "./_components/SettingsModal";
import { IdeSettings, DEFAULT_SETTINGS, LogEntry } from "./_components/types";

function IdePage() {
  const { user, isAuthenticated, logout } = useAuth();
  
  // State: Code & CPU
  const [code, setCode] = useState(
    `# RISC-V Program Entry\n.section .text\n.globl main\nmain:\n  addi x1, x0, 5    # Load 5 into x1\n  addi x2, x0, 10   # Load 10 into x2\n  add  x3, x1, x2   # x3 = x1 + x2\nloop:\n  beq  x0, x0, loop  # Infinite loop`
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
  const [activeView, setActiveView] = useState<"editor" | "memory" | "database" | "terminal">("editor");
  const [rightPanelTab, setRightPanelTab] = useState<"registers" | "memoryMap">("registers");
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
    <>
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

      <main className="flex flex-1 pt-toolbar-height overflow-hidden">
        <SideRail activeView={activeView} onViewChange={setActiveView} />

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 overflow-hidden">
            {/* Main Area: currently only Editor is active */}
            {activeView === "editor" && (
              <CodeEditor 
                code={code} 
                onChange={setCode} 
                fontSize={settings.fontSize} 
                isBinaryMode={isBinaryMode}
                currentLine={model?.currentLine} 
              />
            )}

            {/* Right Panel: Registers or Memory Map */}
            <section className="w-2/5 flex flex-col bg-surface-container-low border-l border-outline-variant">
              {/* Tab Header */}
              <div className="flex h-8 bg-surface-container border-b border-outline-variant flex-shrink-0">
                <button
                  onClick={() => setRightPanelTab("registers")}
                  className={`px-4 h-full flex items-center gap-2 transition-colors ${
                    rightPanelTab === "registers"
                      ? "border-t-2 border-primary bg-surface-container-low text-primary"
                      : "text-on-surface-variant hover:bg-surface-container-high opacity-70 hover:opacity-100"
                  }`}
                >
                  <span className="font-label-caps text-label-caps">REGISTERS</span>
                </button>
                <button
                  onClick={() => setRightPanelTab("memoryMap")}
                  className={`px-4 h-full flex items-center gap-2 transition-colors ${
                    rightPanelTab === "memoryMap"
                      ? "border-t-2 border-primary bg-surface-container-low text-primary"
                      : "text-on-surface-variant hover:bg-surface-container-high opacity-70 hover:opacity-100"
                  }`}
                >
                  <span className="font-label-caps text-label-caps">MEMORY MAP</span>
                </button>
              </div>

              {/* Panel Content */}
              {rightPanelTab === "registers" ? (
                <RegisterPanel
                  model={model}
                  displayFormat={settings.displayFormat}
                  showZeroRegisters={settings.showZeroRegisters}
                />
              ) : (
                <MemoryMapPanel model={model} />
              )}
            </section>
          </div>

          {/* Bottom Panel */}
          <ConsolePanel logs={logs} />
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full flex justify-between items-center px-panel-padding h-8 z-50 bg-surface-container-highest border-t border-outline-variant no-shadow font-code-sm text-code-sm text-on-surface-variant">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isLoading ? "bg-yellow-400 animate-pulse" : "bg-primary"}`} />
            {isLoading ? "Running..." : "Ready"}
          </span>
          <span className="opacity-70">|</span>
          <span>RV32I Toolchain v2.0</span>
          {model && (
            <>
              <span className="opacity-70">|</span>
              <span className={`font-bold ${model.hitLimit ? "text-yellow-500" : "text-primary"}`}>
                {model.stepsExecuted} steps {model.hitLimit && " (limit)"}
              </span>
            </>
          )}
        </div>
        <div className="flex gap-6">
          <a className="opacity-70 hover:text-primary transition-colors" href="#">Docs</a>
          <a className="opacity-70 hover:text-primary transition-colors" href="#">Report Bug</a>
        </div>
      </footer>

      {/* Modals */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </>
  );
}

export default withAuth(IdePage);
