"use client";

import React, { useState } from "react";
import { RiscvService } from "@/domain/riscv/service";
import { RiscvModel, ABI_NAMES } from "@/domain/riscv/model";

export default function Home() {
  const [code, setCode] = useState(`# RISC-V Program Entry\n.section .text\n.globl main\nmain:\n  addi x1, x0, 5    # Load 5 into x1\n  addi x2, x0, 10   # Load 10 into x2\n  add  x3, x1, x2   # x3 = x1 + x2\nloop:\n  beq  x0, x0, loop  # Infinite loop`);
  const [model, setModel] = useState<RiscvModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<{type: 'success' | 'error' | 'info' | 'step', message: string}[]>([
    { type: 'info', message: 'RISC-V IDE Ready. Backend connected.' }
  ]);

  const handleRun = async () => {
    setIsLoading(true);
    setLogs([{ type: 'info', message: 'Compiling and running...' }]);
    try {
      const startTime = performance.now();
      const result = await RiscvService.runCode(code);
      const endTime = performance.now();
      
      setModel(result);
      setLogs([
        { type: 'success', message: `Compilation finished in ${(endTime - startTime).toFixed(0)}ms. 0 errors.` },
        { type: 'info', message: `Execution completed in ${result.stepsExecuted} steps.` }
      ]);
    } catch (error: any) {
      setLogs([{ type: 'error', message: error.message }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRegisterValue = (index: number) => {
    if (!model) return "0x00000000";
    return model.getHexValue(index);
  };

  const isRegisterChanged = (index: number) => {
    if (!model) return false;
    return model.isChanged(index);
  };

  return (
    <>
      {/* TopNavBar */}
      <header className="flex justify-between items-center h-toolbar-height px-panel-padding w-full z-50 bg-surface-container-lowest border-b border-outline-variant no-shadow fixed top-0">
        <div className="flex items-center gap-6">
          <span className="font-display-mono text-display-mono text-primary tracking-tighter text-[16px]">RISC-V Studio</span>
          <nav className="flex gap-4">
            <button className="font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high px-2 py-0.5 transition-colors">File</button>
            <button className="font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high px-2 py-0.5 transition-colors">Edit</button>
            <button className="font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high px-2 py-0.5 transition-colors">Build</button>
            <button className="font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high px-2 py-0.5 transition-colors">Debug</button>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1 text-on-surface-variant hover:bg-surface-container-high transition-colors" title="Restart">
            <span className="material-symbols-outlined">replay</span>
          </button>
          <button 
            onClick={handleRun}
            disabled={isLoading}
            className={`flex items-center gap-1.5 px-3 py-0.5 ${isLoading ? 'bg-outline text-surface' : 'bg-primary-container text-on-primary-container'} font-body-sm text-body-sm hover:opacity-80 transition-all`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
            <span>{isLoading ? "Running..." : "Run"}</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-0.5 border border-outline text-primary font-body-sm text-body-sm hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined">step_into</span>
            <span>Step</span>
          </button>
          <button className="p-1 text-on-surface-variant hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined">pause</span>
          </button>
          <div className="h-4 w-px bg-outline-variant mx-2"></div>
          <button className="p-1 text-on-surface-variant hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
        <div className="flex items-center bg-surface-container-low px-3 h-7 border border-outline-variant">
          <span className="font-code-sm text-code-sm text-primary">PC: {model ? "0x" + (model.stepsExecuted * 4).toString(16).padStart(8, '0').toUpperCase() : "0x00000000"}</span>
        </div>
      </header>

      <main className="flex flex-1 pt-toolbar-height overflow-hidden">
        {/* SideNavBar Rail */}
        <aside className="flex flex-col h-full w-12 bg-surface-container-low border-r border-outline-variant z-40 items-center py-4 gap-4">
          <button className="w-10 h-10 flex items-center justify-center bg-primary-container text-on-primary-container border-l-2 border-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>code</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container">
            <span className="material-symbols-outlined">memory</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container">
            <span className="material-symbols-outlined">database</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container">
            <span className="material-symbols-outlined">terminal</span>
          </button>
          <div className="mt-auto flex flex-col gap-4 mb-4">
            <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container">
              <span className="material-symbols-outlined">help</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </aside>

        {/* Editor & Panels Container */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 overflow-hidden">
            {/* Code Editor Area */}
            <section className="w-3/5 flex flex-col bg-surface-container-lowest border-r border-outline-variant">
              <div className="flex items-center h-8 bg-surface-container px-3 border-b border-outline-variant">
                <span className="font-label-caps text-label-caps text-on-surface-variant">MAIN.S</span>
              </div>
              <div className="flex-1 font-code-md text-code-md overflow-hidden flex bg-surface-bright relative">
                {/* Line Numbers */}
                <div className="w-12 bg-surface-container-low text-right pr-3 py-4 text-outline select-none border-r border-outline-variant">
                  {code.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
                </div>
                {/* Editable Textarea */}
                <textarea 
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="flex-1 py-4 px-4 whitespace-pre leading-6 relative bg-transparent resize-none outline-none text-primary"
                  spellCheck="false"
                />
              </div>
            </section>

            {/* Right Sidebar */}
            <section className="w-2/5 flex flex-col bg-surface-container-low">
              {/* Tab Header */}
              <div className="flex h-8 bg-surface-container border-b border-outline-variant">
                <button className="px-4 h-full border-t-2 border-primary bg-surface-container-low flex items-center gap-2">
                  <span className="font-label-caps text-label-caps text-primary">REGISTERS</span>
                </button>
                <button className="px-4 h-full text-on-surface-variant opacity-60 hover:opacity-100 flex items-center gap-2">
                  <span className="font-label-caps text-label-caps">MEMORY MAP</span>
                </button>
              </div>

              {/* Registers Content */}
              <div className="flex-1 overflow-y-auto p-panel-padding pb-10">
                <div className="grid grid-cols-2 gap-gutter bg-outline-variant border border-outline-variant">
                  {/* Header Row */}
                  <div className="bg-surface-container-highest p-1 text-center font-label-caps text-label-caps text-on-surface-variant">REG</div>
                  <div className="bg-surface-container-highest p-1 text-center font-label-caps text-label-caps text-on-surface-variant">VALUE (HEX)</div>
                  
                  {/* Register Rows */}
                  {ABI_NAMES.map((abiName, i) => {
                    const changed = isRegisterChanged(i);
                    return (
                      <React.Fragment key={i}>
                        <div className={`bg-surface-container-lowest p-2 font-code-sm text-code-sm ${changed ? 'bg-primary-fixed' : ''}`}>
                          x{i} ({abiName})
                        </div>
                        <div className={`bg-surface-container-lowest p-2 font-code-sm text-code-sm ${changed ? 'text-primary font-bold bg-primary-fixed' : 'text-outline'}`}>
                          {getRegisterValue(i)}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>

          {/* Console / Bottom Panel */}
          <section className="h-48 bg-inverse-surface text-inverse-on-surface border-t border-outline-variant flex flex-col z-10 pb-10">
            <div className="flex items-center h-8 bg-[#131b2e] px-3 border-b border-white/5 justify-between">
              <div className="flex gap-4">
                <button className="font-label-caps text-label-caps text-primary-fixed border-b border-primary-fixed pb-0.5">CONSOLE</button>
                <button className="font-label-caps text-label-caps opacity-50">OUTPUT</button>
                <button className="font-label-caps text-label-caps opacity-50">PROBLEMS</button>
              </div>
              <span className="material-symbols-outlined text-[14px] opacity-60">close</span>
            </div>
            <div className="flex-1 p-3 font-code-sm text-code-sm overflow-y-auto leading-relaxed">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2 mt-1">
                  <span className={log.type === 'error' ? 'text-error' : log.type === 'success' ? 'text-primary-fixed' : 'text-secondary-fixed-dim'}>
                    [{log.type.toUpperCase()}]
                  </span>
                  <span className={log.type === 'error' ? 'text-error' : ''}>{log.message}</span>
                </div>
              ))}
              <div className="flex gap-2 mt-1 items-center">
                <span className="text-primary-fixed-dim">{" > "}</span>
                <input className="bg-transparent border-none p-0 focus:ring-0 w-full font-code-sm outline-none" placeholder="Type debugger command..." type="text" />
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full flex justify-between items-center px-panel-padding h-8 z-50 bg-surface-container-highest border-t border-outline-variant no-shadow font-code-sm text-code-sm text-on-surface-variant">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span> Ready</span>
          <span className="opacity-70">|</span>
          <span>RISC-V Toolchain v2.4.1</span>
        </div>
        <div className="flex gap-6">
          <a className="opacity-70 hover:text-primary transition-colors" href="#">Documentation</a>
          <a className="opacity-70 hover:text-primary transition-colors" href="#">Issue Tracker</a>
        </div>
      </footer>
    </>
  );
}
