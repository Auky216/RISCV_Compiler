"use client";

import React, { useState, useRef } from "react";
import { RiscvModel } from "@/domain/riscv/model";

interface DatapathPanelProps {
  model: RiscvModel | null;
}

export function DatapathPanel({ model }: DatapathPanelProps) {
  const s = model?.controlSignals || {};

  // Empezar con zoom intermedio (0.55) para que sea más legible y separado
  const [scale, setScale] = useState(0.55);
  const [pan, setPan] = useState({ x: -100, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    setScale((prevScale) => Math.min(Math.max(0.3, prevScale + delta), 3));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const zoomIn = () => setScale(s => Math.min(s + 0.2, 3));
  const zoomOut = () => setScale(s => Math.max(s - 0.2, 0.3));
  const resetZoom = () => {
    setScale(0.55);
    setPan({ x: -100, y: 50 });
  };

  const primaryColor = "var(--color-primary)"; // Dynamic Border/Text Color
  const bgColor = "var(--color-background)"; // Dynamic Background Color

  const getWireColor = (isActive: boolean | undefined | null, defaultColor = primaryColor) => {
    return isActive ? "#ef4444" : defaultColor; // Bright Red for active wires on white background
  };

  const getStrokeWidth = (isActive: boolean | undefined | null) => {
    return isActive ? "6" : "3"; // Bolder wires
  };

  const toHex = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return "";
    return `0x${(val >>> 0).toString(16).toUpperCase()}`;
  };

  // Control Signals with fallback logic if the backend doesn't explicitly send them
  const isMemWrite = s["MemWrite"] === 1;
  const isALUSrc = s["ALUSrc"] === 1;
  const isResultSrc = s["ResultSrc"] === 1;
  const isBranch = s["PCSrc"] === 1;
  const isZero = s["Zero"] === 1;
  
  const instr = s["Instr"] || 0;
  const opcode = instr & 0x7F;
  const isRType = opcode === 51;
  const isIType = opcode === 19 || opcode === 3 || opcode === 103;
  const isSType = opcode === 35;
  const isBType = opcode === 99;
  const isUType = opcode === 55 || opcode === 23;
  const isJType = opcode === 111;
  
  const isRegWrite = s["RegWrite"] === 1 || isRType || isIType || isUType || isJType || opcode === 3;
  
  const usesRs1 = isRType || isIType || isSType || isBType;
  const usesRs2 = isRType || isSType || isBType;
  
  const isRunning = model && !model.isFinished && model.stepsExecuted >= 0;

  const DataBadge = ({ x, y, value, color }: { x: number, y: number, value: string | undefined, color: string }) => {
    if (!value) return null;
    const width = value.length * 9 + 16;
    return (
      <g transform={`translate(${x - width/2}, ${y - 12})`}>
        <rect width={width} height="24" rx="0" fill="#fff7" stroke="#ef4444" strokeWidth="2" />
        <text x={width/2} y="16" fontSize="12" textAnchor="middle" fill="#ef4444" fontWeight="bold" style={{ fontFamily: "monospace" }}>{value}</text>
      </g>
    );
  };

  return (
    <div className="flex-1 w-full h-full bg-background relative overflow-hidden flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-background border-b-2 border-primary gap-4 flex-shrink-0 shadow-[0_2px_0_var(--color-primary)] z-10">
        <div className="flex items-center gap-4">
          <span className="font-pixel-title text-xs text-primary uppercase">
            ESQUEMA DE DATAPATH / DATAPATH DIAGRAM
          </span>
        </div>
        {model && (
          <div className="flex items-center gap-3 bg-yellow-200 border-2 border-primary px-4 py-2 font-mono text-base text-primary shadow-[4px_4px_0_var(--color-primary)] font-extrabold">
            <span className="text-xs font-pixel-title animate-pulse text-red-500">▶</span>
            <span>ASM: 0x{model.pc?.toString(16).toUpperCase().padStart(8, '0')} — {model.disassembly || "EJECUTANDO..."}</span>
          </div>
        )}
      </div>

      <div className="absolute top-16 right-4 z-10 flex gap-2 bg-background p-2 border-2 border-primary shadow-[2px_2px_0_var(--color-primary)]">
        <button onClick={zoomIn} className="p-2 hover:bg-primary hover:text-background border-[1px] border-transparent hover:border-background rounded-none text-primary material-symbols-outlined transition-colors" title="Zoom In">zoom_in</button>
        <button onClick={zoomOut} className="p-2 hover:bg-primary hover:text-background border-[1px] border-transparent hover:border-background rounded-none text-primary material-symbols-outlined transition-colors" title="Zoom Out">zoom_out</button>
        <button onClick={resetZoom} className="p-2 hover:bg-primary hover:text-background border-[1px] border-transparent hover:border-background rounded-none text-primary material-symbols-outlined transition-colors" title="Reset View">fit_screen</button>
      </div>

      <div 
        className="flex-1 w-full h-full bg-background cursor-grab active:cursor-grabbing overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          backgroundImage: "radial-gradient(rgba(37,99,235,0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          backgroundPosition: "0 0"
        }}
      >
        <div 
          className="w-full h-full flex justify-center items-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.1s ease-out"
          }}
        >
          <div className="relative bg-background border-[2px] border-primary shadow-[2px_2px_0_var(--color-primary)] p-8" style={{ width: '1600px', height: '1000px', minWidth: '1600px', minHeight: '1000px' }}>
            <svg width="1600" height="1000" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 pointer-events-none" style={{ fontFamily: 'monospace' }}>
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <polygon points="0 1.5, 10 4, 0 6.5" fill={primaryColor} />
                </marker>
                <marker id="arrowhead-active" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <polygon points="0 1.5, 10 4, 0 6.5" fill="#ef4444" />
                </marker>
              </defs>

              {/* ==========================================
                  BLOQUES DE HARDWARE
                  ========================================== */}
                  
              {/* PC */}
              <rect x="200" y="400" width="30" height="60" fill={bgColor} stroke={primaryColor} strokeWidth="2" />
              <polygon points="205,460 215,445 225,460" fill={bgColor} stroke={primaryColor} strokeWidth="2" /> 
              <text x="215" y="435" fontSize="16" textAnchor="middle" fill={primaryColor} fontWeight="bold">PC</text>
              <text x="195" y="390" fontSize="14" fill={primaryColor} fontWeight="bold">CLK</text>

              {/* Instruction Memory */}
              <rect x="350" y="330" width="120" height="200" fill={bgColor} stroke={primaryColor} strokeWidth="2" />
              <text x="360" y="435" fontSize="16" fill={primaryColor} fontWeight="bold">A</text>
              <text x="440" y="435" fontSize="16" fill={primaryColor} fontWeight="bold">RD</text>
              <text x="410" y="415" fontSize="18" textAnchor="middle" fill={primaryColor} fontWeight="bold">INSTRUCTION</text>
              <text x="410" y="435" fontSize="18" textAnchor="middle" fill={primaryColor} fontWeight="bold">MEMORY</text>

              {/* Control Unit */}
              <rect x="620" y="20" width="100" height="340" fill={bgColor} stroke={primaryColor} strokeWidth="2" />
              <text x="670" y="150" fontSize="18" textAnchor="middle" fill={primaryColor} fontWeight="bold">CONTROL</text>
              <text x="670" y="170" fontSize="18" textAnchor="middle" fill={primaryColor} fontWeight="bold">UNIT</text>

              {/* Register File */}
              <rect x="750" y="380" width="140" height="200" fill={bgColor} stroke={primaryColor} strokeWidth="2" />
              <text x="820" y="470" fontSize="18" textAnchor="middle" fill={primaryColor} fontWeight="bold">REGISTER</text>
              <text x="820" y="490" fontSize="18" textAnchor="middle" fill={primaryColor} fontWeight="bold">FILE</text>
              <polygon points="765,580 775,565 785,580" fill={bgColor} stroke={primaryColor} strokeWidth="2" /> 
              <text x="760" y="370" fontSize="14" fill={primaryColor} fontWeight="bold">CLK</text>
              
              <text x="760" y="425" fontSize="16" fill={primaryColor} fontWeight="bold">A1</text>
              <text x="760" y="485" fontSize="16" fill={primaryColor} fontWeight="bold">A2</text>
              <text x="760" y="545" fontSize="16" fill={primaryColor} fontWeight="bold">A3</text>
              <text x="760" y="570" fontSize="16" fill={primaryColor} fontWeight="bold">WD3</text>
              <text x="820" y="405" fontSize="16" fill={primaryColor} fontWeight="bold">WE3</text>
              <text x="850" y="425" fontSize="16" fill={primaryColor} fontWeight="bold">RD1</text>
              <text x="850" y="525" fontSize="16" fill={primaryColor} fontWeight="bold">RD2</text>

              {/* Extend */}
              <polygon points="750,750 870,750 890,800 750,800" fill={bgColor} stroke={primaryColor} strokeWidth="2" />
              <text x="815" y="780" fontSize="18" textAnchor="middle" fill={primaryColor} fontWeight="bold">EXTEND</text>

              {/* ALU */}
              <polygon points="1100,360 1150,380 1150,500 1100,520 1100,460 1120,440 1100,420" fill={bgColor} stroke={primaryColor} strokeWidth="2" />
              <text x="1135" y="445" fontSize="18" textAnchor="middle" fill={primaryColor} fontWeight="bold">ALU</text>

              {/* Data Memory */}
              <rect x="1300" y="350" width="120" height="200" fill={bgColor} stroke={primaryColor} strokeWidth="2" />
              <text x="1360" y="440" fontSize="18" textAnchor="middle" fill={primaryColor} fontWeight="bold">DATA</text>
              <text x="1360" y="460" fontSize="18" textAnchor="middle" fill={primaryColor} fontWeight="bold">MEMORY</text>
              <polygon points="1310,550 1320,535 1330,550" fill={bgColor} stroke={primaryColor} strokeWidth="2" />
              <text x="1305" y="340" fontSize="14" fill={primaryColor} fontWeight="bold">CLK</text>
              <text x="1345" y="375" fontSize="16" fill={primaryColor} fontWeight="bold">WE</text>
              <text x="1310" y="445" fontSize="16" fill={primaryColor} fontWeight="bold">A</text>
              <text x="1310" y="545" fontSize="16" fill={primaryColor} fontWeight="bold">WD</text>
              <text x="1390" y="445" fontSize="16" fill={primaryColor} fontWeight="bold">RD</text>

              {/* Adders */}
              {/* PCPlus4 Adder */}
              <polygon points="350,730 380,740 380,780 350,790 350,770 360,760 350,750" fill={bgColor} stroke={primaryColor} strokeWidth="2" />
              <text x="370" y="765" fontSize="20" textAnchor="middle" fill={primaryColor} fontWeight="bold">+</text>

              {/* PCTarget Adder */}
              <polygon points="1100,730 1130,740 1130,780 1100,790 1100,770 1110,760 1100,750" fill={bgColor} stroke={primaryColor} strokeWidth="2" />
              <text x="1120" y="765" fontSize="20" textAnchor="middle" fill={primaryColor} fontWeight="bold">+</text>


              {/* ==========================================
                  MUXES
                  ========================================== */}
              {/* PC MUX */}
              <g transform="translate(100, 400)">
                <polygon points="0,0 20,15 20,65 0,80" fill={bgColor} stroke={primaryColor} strokeWidth="2" />
                <text x="6" y="25" fontSize="16" fill={primaryColor} fontWeight="bold">0</text>
                <text x="6" y="65" fontSize="16" fill={primaryColor} fontWeight="bold">1</text>
              </g>

              {/* ALUSrc MUX */}
              <g transform="translate(1000, 450)">
                <polygon points="0,0 20,15 20,65 0,80" fill={bgColor} stroke={primaryColor} strokeWidth="2" />
                <text x="6" y="25" fontSize="16" fill={primaryColor} fontWeight="bold">0</text>
                <text x="6" y="65" fontSize="16" fill={primaryColor} fontWeight="bold">1</text>
              </g>

              {/* Result MUX */}
              <g transform="translate(1500, 420)">
                <polygon points="0,0 20,15 20,65 0,80" fill={bgColor} stroke={primaryColor} strokeWidth="2" />
                <text x="6" y="25" fontSize="16" fill={primaryColor} fontWeight="bold">0</text>
                <text x="6" y="65" fontSize="16" fill={primaryColor} fontWeight="bold">1</text>
              </g>


              {/* ==========================================
                  RUTAS Y CABLES (Wires)
                  ========================================== */}
              
              {/* PC Mux -> PC */}
              <path d="M 120 440 L 190 440" stroke={getWireColor(isRunning ?? false, primaryColor)} strokeWidth={getStrokeWidth(isRunning ?? false)} fill="none" markerEnd={isRunning ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              <text x="160" y="430" fontSize="12" textAnchor="middle" fill={primaryColor} fontWeight="bold">PCNext</text>
              {isRunning && <DataBadge x={160} y={460} value={toHex(s["PCNext"])} color="#ef4444" />}

              {/* PC -> Instr Mem & Adders */}
              <path d="M 230 430 L 340 430" stroke={getWireColor(isRunning ?? false, primaryColor)} strokeWidth={getStrokeWidth(isRunning ?? false)} fill="none" markerEnd={isRunning ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              {isRunning && <DataBadge x={285} y={410} value={toHex(model?.pc)} color="#00ffff" />}
              
              <path d="M 285 745 L 285 700 L 1100 700" stroke={getWireColor(isRunning, primaryColor)} strokeWidth={getStrokeWidth(isRunning)} fill="none" markerEnd={isRunning ? "url(#arrowhead-active)" : "url(#arrowhead)"} />

              {/* 4 -> PCPlus4 Adder */}
              <text x="310" y="780" fontSize="12" fill={primaryColor} fontWeight="bold">4</text>
              <path d="M 320 775 L 340 775" stroke={primaryColor} strokeWidth="3" fill="none" markerEnd="url(#arrowhead)" />
              
              {/* PCPlus4 Adder -> PC Mux 0 */}
              <path d="M 380 760 L 420 760 L 420 850 L 70 850 L 70 420 L 90 420" stroke={getWireColor(isRunning && !isBranch, primaryColor)} strokeWidth={getStrokeWidth(isRunning && !isBranch)} fill="none" markerEnd={isRunning && !isBranch ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              <text x="450" y="840" fontSize="12" fill={primaryColor} fontWeight="bold">PCPlus4</text>

              {/* ==========================================
                  BUS PRINCIPAL DE INSTR
                  ========================================== */}
              <path d="M 470 430 L 550 430" stroke={getWireColor(isRunning, primaryColor)} strokeWidth={getStrokeWidth(isRunning)} fill="none" />
              <text x="510" y="420" fontSize="12" textAnchor="middle" fill={primaryColor} fontWeight="bold">Instr</text>
              {isRunning && <DataBadge x={510} y={455} value={toHex(s["Instr"])} color="#00ffff" />}

              {/* Vertical Bus */}
              <path d="M 550 150 L 550 775" stroke={getWireColor(isRunning, primaryColor)} strokeWidth={getStrokeWidth(isRunning)} fill="none" />

              {/* Taps hacia Control Unit */}
              <path d="M 550 80 L 620 80" stroke={getWireColor(isRunning, primaryColor)} strokeWidth={getStrokeWidth(isRunning)} fill="none" markerEnd={isRunning ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              <text x="585" y="70" fontSize="12" textAnchor="middle" fill={primaryColor} fontWeight="bold">6:0 op</text>
              
              <path d="M 550 160 L 620 160" stroke={getWireColor(isRunning, primaryColor)} strokeWidth={getStrokeWidth(isRunning)} fill="none" markerEnd={isRunning ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              <text x="585" y="150" fontSize="12" textAnchor="middle" fill={primaryColor} fontWeight="bold">14:12 funct3</text>

              <path d="M 550 240 L 620 240" stroke={getWireColor(isRunning, primaryColor)} strokeWidth={getStrokeWidth(isRunning)} fill="none" markerEnd={isRunning ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              <text x="585" y="230" fontSize="12" textAnchor="middle" fill={primaryColor} fontWeight="bold">30 funct7</text>

              {/* Taps hacia Register File */}
              <path d="M 550 420 L 740 420" stroke={getWireColor(isRunning && usesRs1, primaryColor)} strokeWidth={getStrokeWidth(isRunning && usesRs1)} fill="none" markerEnd={isRunning && usesRs1 ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              <text x="645" y="410" fontSize="12" textAnchor="middle" fill={primaryColor} fontWeight="bold">19:15</text>
              
              <path d="M 550 480 L 740 480" stroke={getWireColor(isRunning && usesRs2, primaryColor)} strokeWidth={getStrokeWidth(isRunning && usesRs2)} fill="none" markerEnd={isRunning && usesRs2 ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              <text x="645" y="470" fontSize="12" textAnchor="middle" fill={primaryColor} fontWeight="bold">24:20</text>
              
              <path d="M 550 540 L 740 540" stroke={getWireColor(isRunning && isRegWrite, primaryColor)} strokeWidth={getStrokeWidth(isRunning && isRegWrite)} fill="none" markerEnd={isRunning && isRegWrite ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              <text x="645" y="530" fontSize="12" textAnchor="middle" fill={primaryColor} fontWeight="bold">11:7</text>

              {/* Tap hacia Extend */}
              <path d="M 550 775 L 740 775" stroke={getWireColor(isRunning, primaryColor)} strokeWidth={getStrokeWidth(isRunning)} fill="none" markerEnd={isRunning ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              <text x="645" y="765" fontSize="12" textAnchor="middle" fill={primaryColor} fontWeight="bold">31:7</text>

              {/* ========================================== */}

              {/* RF RD1 -> ALU A */}
              <path d="M 890 420 L 1090 420" stroke={getWireColor(isRunning && usesRs1, primaryColor)} strokeWidth={getStrokeWidth(isRunning && usesRs1)} fill="none" markerEnd={isRunning && usesRs1 ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              <text x="940" y="410" fontSize="12" textAnchor="middle" fill={primaryColor} fontWeight="bold">SrcA</text>

              {/* RF RD2 -> MUX 0 & DataMem WD */}
              <path d="M 890 520 L 950 520 L 950 470 L 990 470" stroke={getWireColor(isRunning && usesRs2 && !isALUSrc, primaryColor)} strokeWidth={getStrokeWidth(isRunning && usesRs2 && !isALUSrc)} fill="none" markerEnd={isRunning && usesRs2 && !isALUSrc ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              <path d="M 950 520 L 950 540 L 1290 540" stroke={getWireColor(isRunning && isSType, primaryColor)} strokeWidth={getStrokeWidth(isRunning && isSType)} fill="none" markerEnd={isRunning && isSType ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              <text x="1200" y="530" fontSize="12" fill={primaryColor} fontWeight="bold">WriteData</text>
              {isRunning && <DataBadge x={1200} y={560} value={toHex(s["WriteData"])} color="#00ffff" />}

              {/* Extend -> MUX 1 & PCTarget Adder */}
              <path d="M 890 775 L 980 775" stroke={getWireColor(isRunning, primaryColor)} strokeWidth={getStrokeWidth(isRunning)} fill="none" />
              <text x="935" y="765" fontSize="12" textAnchor="middle" fill={primaryColor} fontWeight="bold">ImmExt</text>
              {isRunning && <DataBadge x={935} y={800} value={toHex(s["ImmExt"])} color="#00ffff" />}
              
              <path d="M 980 775 L 980 510 L 990 510" stroke={getWireColor(isALUSrc, primaryColor)} strokeWidth={getStrokeWidth(isALUSrc)} fill="none" markerEnd={isALUSrc ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              <path d="M 980 775 L 1090 775" stroke={getWireColor(isBranch, primaryColor)} strokeWidth={getStrokeWidth(isBranch)} fill="none" markerEnd={isBranch ? "url(#arrowhead-active)" : "url(#arrowhead)"} />

              {/* ALUSrc MUX -> ALU B */}
              <path d="M 1020 490 L 1090 490" stroke={getWireColor(isRunning, primaryColor)} strokeWidth={getStrokeWidth(isRunning)} fill="none" markerEnd={isRunning ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              <text x="1055" y="480" fontSize="12" textAnchor="middle" fill={primaryColor} fontWeight="bold">SrcB</text>

              {/* ALU -> DataMem & Result MUX 0 */}
              <path d="M 1150 440 L 1220 440" stroke={getWireColor(isRunning, primaryColor)} strokeWidth={getStrokeWidth(isRunning)} fill="none" />
              <text x="1185" y="430" fontSize="12" textAnchor="middle" fill={primaryColor} fontWeight="bold">ALUResult</text>
              {isRunning && <DataBadge x={1185} y={465} value={toHex(s["ALUResult"])} color="#00ffff" />}

              <path d="M 1220 440 L 1290 440" stroke={getWireColor(isRunning, primaryColor)} strokeWidth={getStrokeWidth(isRunning)} fill="none" markerEnd={isRunning ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              <path d="M 1220 440 L 1220 320 L 1480 320 L 1480 440 L 1500 440" stroke={getWireColor(isRunning && !isResultSrc, primaryColor)} strokeWidth={getStrokeWidth(isRunning && !isResultSrc)} fill="none" markerEnd={isRunning && !isResultSrc ? "url(#arrowhead-active)" : "url(#arrowhead)"} />

              {/* DataMem -> Result MUX 1 */}
              <path d="M 1420 440 L 1460 440 L 1460 480 L 1500 480" stroke={getWireColor(isResultSrc, primaryColor)} strokeWidth={getStrokeWidth(isResultSrc)} fill="none" markerEnd={isResultSrc ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              <text x="1460" y="430" fontSize="12" textAnchor="middle" fill={primaryColor} fontWeight="bold">ReadData</text>
              {isRunning && <DataBadge x={1460} y={505} value={toHex(s["ReadData"])} color="#00ffff" />}

              {/* Result MUX -> RegFile WD3 */}
              <path d="M 1520 460 L 1560 460 L 1560 900 L 700 900 L 700 560 L 740 560" stroke={getWireColor(isRegWrite, primaryColor)} strokeWidth={getStrokeWidth(isRegWrite)} fill="none" markerEnd={isRegWrite ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              <text x="1540" y="450" fontSize="12" textAnchor="middle" fill={primaryColor} fontWeight="bold">Result</text>
              {isRunning && <DataBadge x={1540} y={485} value={toHex(s["Result"])} color="#00ffff" />}

              {/* PCTarget Adder -> PC MUX 1 */}
              <path d="M 1130 760 L 1180 760 L 1180 950 L 50 950 L 50 460 L 90 460" stroke={getWireColor(isBranch, primaryColor)} strokeWidth={getStrokeWidth(isBranch)} fill="none" markerEnd={isBranch ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              <text x="1155" y="750" fontSize="12" textAnchor="middle" fill={primaryColor} fontWeight="bold">PCTarget</text>
              {isRunning && <DataBadge x={1155} y={785} value={toHex(s["PCTarget"])} color="#00ffff" />}

              {/* ALU Zero -> Control */}
              <path d="M 1150 400 L 1180 400 L 1180 290 L 720 290" stroke={getWireColor(isZero, primaryColor)} strokeWidth={getStrokeWidth(isZero)} fill="none" markerEnd={isZero ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              <text x="1165" y="390" fontSize="12" fill={getWireColor(isZero, primaryColor)} fontWeight="bold">Zero</text>

              {/* ==========================================
                  CONTROL SIGNALS
                  ========================================== */}
              
              {/* PCSrc */}
              <path d="M 720 50 L 750 50 L 750 10 L 110 10 L 110 390" stroke={getWireColor(isBranch, primaryColor)} strokeWidth={getStrokeWidth(isBranch)} fill="none" markerEnd={isBranch ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              <text x="730" y="45" fontSize="12" fill={getWireColor(isBranch, primaryColor)} fontWeight={isBranch ? "bold" : "normal"}>PCSrc</text>

              {/* ResultSrc */}
              <path d="M 720 90 L 1510 90 L 1510 410" stroke={getWireColor(isResultSrc, primaryColor)} strokeWidth={getStrokeWidth(isResultSrc)} fill="none" markerEnd={isResultSrc ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              <text x="730" y="85" fontSize="12" fill={getWireColor(isResultSrc, primaryColor)} fontWeight={isResultSrc ? "bold" : "normal"}>ResultSrc</text>

              {/* MemWrite */}
              <path d="M 720 130 L 1360 130 L 1360 340" stroke={getWireColor(isMemWrite, primaryColor)} strokeWidth={getStrokeWidth(isMemWrite)} fill="none" markerEnd={isMemWrite ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              <text x="730" y="125" fontSize="12" fill={getWireColor(isMemWrite, primaryColor)} fontWeight={isMemWrite ? "bold" : "normal"}>MemWrite</text>

              {/* ALUControl */}
              <path d="M 720 170 L 1130 170 L 1130 350" stroke={getWireColor(isRunning, primaryColor)} strokeWidth={getStrokeWidth(isRunning)} fill="none" markerEnd={isRunning ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              <text x="730" y="165" fontSize="12" fill={getWireColor(isRunning, primaryColor)} fontWeight={isRunning ? "bold" : "normal"}>ALUControl<tspan fontSize="10" dy="4">2:0</tspan></text>

              {/* ALUSrc */}
              <path d="M 720 210 L 1010 210 L 1010 440" stroke={getWireColor(isALUSrc, primaryColor)} strokeWidth={getStrokeWidth(isALUSrc)} fill="none" markerEnd={isALUSrc ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              <text x="730" y="205" fontSize="12" fill={getWireColor(isALUSrc, primaryColor)} fontWeight={isALUSrc ? "bold" : "normal"}>ALUSrc</text>

              {/* ImmSrc */}
              <path d="M 670 360 L 670 730 L 810 730 L 810 750" stroke={getWireColor(isRunning, primaryColor)} strokeWidth={getStrokeWidth(isRunning)} fill="none" markerEnd={isRunning ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              <text x="680" y="380" fontSize="12" fill={getWireColor(isRunning, primaryColor)} fontWeight={isRunning ? "bold" : "normal"}>ImmSrc<tspan fontSize="10" dy="4">1:0</tspan></text>

              {/* RegWrite */}
              <path d="M 720 250 L 820 250 L 820 380" stroke={getWireColor(isRegWrite, primaryColor)} strokeWidth={getStrokeWidth(isRegWrite)} fill="none" markerEnd={isRegWrite ? "url(#arrowhead-active)" : "url(#arrowhead)"} />
              <text x="730" y="245" fontSize="12" fill={getWireColor(isRegWrite, primaryColor)} fontWeight={isRegWrite ? "bold" : "normal"}>RegWrite</text>

            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
