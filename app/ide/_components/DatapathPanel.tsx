"use client";

import React, { useState, useRef } from "react";
import { RiscvModel } from "@/domain/riscv/model";

interface DatapathPanelProps {
  model: RiscvModel | null;
}

export function DatapathPanel({ model }: DatapathPanelProps) {
  const s = model?.controlSignals || {};

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
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
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const getWireColor = (isActive: boolean | undefined, defaultColor = "black") => {
    if (isActive === undefined) return defaultColor;
    return isActive ? "#2563eb" : defaultColor;
  };

  const getStrokeWidth = (isActive: boolean | undefined) => {
    return isActive ? 3 : 1.5;
  };

  const toHex = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return "";
    return `0x${(val >>> 0).toString(16).toUpperCase()}`;
  };

  const isRegWrite = s["RegWrite"] === 1;
  const isMemWrite = s["MemWrite"] === 1;
  const isALUSrc = s["ALUSrc"] === 1;
  const isResultSrc = s["ResultSrc"] === 1;
  const isBranch = s["PCSrc"] === 1;
  const isZero = s["Zero"] === 1;
  
  const isRunning = model && !model.isFinished && model.stepsExecuted >= 0;

  const DataBadge = ({ x, y, value, color }: { x: number, y: number, value: string | undefined, color: string }) => {
    if (!value) return null;
    const width = value.length * 7 + 12;
    return (
      <g transform={`translate(${x - width/2}, ${y - 10})`}>
        <rect width={width} height="20" rx="4" fill="white" stroke={color} strokeWidth="1.5" />
        <text x={width/2} y="14" fontSize="11" textAnchor="middle" fill={color} fontWeight="bold">{value}</text>
      </g>
    );
  };

  return (
    <div className="flex-1 w-full h-full bg-surface-container-lowest relative overflow-hidden flex flex-col">
      <div className="absolute top-4 right-4 z-10 flex gap-2 bg-surface-bright p-1 rounded border border-outline-variant shadow-sm">
        <button onClick={zoomIn} className="p-2 hover:bg-surface-container rounded text-on-surface material-symbols-outlined" title="Zoom In">zoom_in</button>
        <button onClick={zoomOut} className="p-2 hover:bg-surface-container rounded text-on-surface material-symbols-outlined" title="Zoom Out">zoom_out</button>
        <button onClick={resetZoom} className="p-2 hover:bg-surface-container rounded text-on-surface material-symbols-outlined" title="Reset View">fit_screen</button>
      </div>

      <div 
        className="flex-1 w-full h-full bg-white cursor-grab active:cursor-grabbing overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="w-full h-full flex justify-center items-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.1s ease-out"
          }}
        >
          <div className="relative" style={{ width: '1600px', height: '1000px', minWidth: '1600px', minHeight: '1000px' }}>
            <svg width="1600" height="1000" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 pointer-events-none" style={{ fontFamily: 'Arial, sans-serif' }}>
              <defs>
                {/* Puntas de flecha mucho más delgadas y elegantes */}
                <marker id="arrowhead" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <polygon points="0 1.5, 10 4, 0 6.5" fill="black" />
                </marker>
                <marker id="arrowhead-blue" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <polygon points="0 1.5, 10 4, 0 6.5" fill="#2563eb" />
                </marker>
              </defs>

              {/* ==========================================
                  BLOQUES DE HARDWARE
                  ========================================== */}
                  
              {/* PC */}
              <rect x="200" y="400" width="30" height="60" fill="white" stroke="black" strokeWidth="2" />
              <polygon points="205,460 215,445 225,460" fill="white" stroke="black" strokeWidth="1" /> 
              <text x="215" y="435" fontSize="14" textAnchor="middle" fill="black" fontWeight="bold">PC</text>
              <text x="195" y="390" fontSize="12" fill="black">CLK</text>

              {/* Instruction Memory */}
              <rect x="350" y="330" width="120" height="200" fill="white" stroke="black" strokeWidth="2" />
              <text x="360" y="435" fontSize="14" fill="black">A</text>
              <text x="440" y="435" fontSize="14" fill="black">RD</text>
              <text x="410" y="415" fontSize="16" textAnchor="middle" fill="black" fontWeight="bold">Instruction</text>
              <text x="410" y="435" fontSize="16" textAnchor="middle" fill="black" fontWeight="bold">Memory</text>

              {/* Control Unit */}
              <rect x="700" y="50" width="100" height="230" rx="20" fill="white" stroke="black" strokeWidth="2" />
              <text x="750" y="150" fontSize="16" textAnchor="middle" fill="black" fontWeight="bold">Control</text>
              <text x="750" y="170" fontSize="16" textAnchor="middle" fill="black" fontWeight="bold">Unit</text>

              {/* Register File */}
              <rect x="750" y="380" width="140" height="200" fill="white" stroke="black" strokeWidth="2" />
              <text x="820" y="470" fontSize="16" textAnchor="middle" fill="black" fontWeight="bold">Register</text>
              <text x="820" y="490" fontSize="16" textAnchor="middle" fill="black" fontWeight="bold">File</text>
              <polygon points="765,580 775,565 785,580" fill="white" stroke="black" strokeWidth="1" /> 
              <text x="760" y="370" fontSize="12" fill="black">CLK</text>
              
              <text x="760" y="425" fontSize="14" fill="black">A1</text>
              <text x="760" y="485" fontSize="14" fill="black">A2</text>
              <text x="760" y="545" fontSize="14" fill="black">A3</text>
              <text x="760" y="570" fontSize="14" fill="black">WD3</text>
              <text x="820" y="405" fontSize="14" fill="black">WE3</text>
              <text x="850" y="425" fontSize="14" fill="black">RD1</text>
              <text x="850" y="525" fontSize="14" fill="black">RD2</text>

              {/* Extend */}
              <polygon points="750,750 870,750 890,800 750,800" fill="white" stroke="black" strokeWidth="2" />
              <text x="815" y="780" fontSize="16" textAnchor="middle" fill="black" fontWeight="bold">Extend</text>

              {/* ALU */}
              <polygon points="1100,360 1150,380 1150,500 1100,520 1100,460 1120,440 1100,420" fill="white" stroke="black" strokeWidth="2" />
              <text x="1135" y="445" fontSize="16" textAnchor="middle" fill="black" fontWeight="bold">ALU</text>

              {/* Data Memory */}
              <rect x="1300" y="350" width="120" height="200" fill="white" stroke="black" strokeWidth="2" />
              <text x="1360" y="440" fontSize="16" textAnchor="middle" fill="black" fontWeight="bold">Data</text>
              <text x="1360" y="460" fontSize="16" textAnchor="middle" fill="black" fontWeight="bold">Memory</text>
              <polygon points="1310,550 1320,535 1330,550" fill="white" stroke="black" strokeWidth="1" />
              <text x="1305" y="340" fontSize="12" fill="black">CLK</text>
              <text x="1345" y="375" fontSize="14" fill="black">WE</text>
              <text x="1310" y="445" fontSize="14" fill="black">A</text>
              <text x="1310" y="545" fontSize="14" fill="black">WD</text>
              <text x="1390" y="445" fontSize="14" fill="black">RD</text>

              {/* Adders */}
              {/* PCPlus4 Adder */}
              <polygon points="350,730 380,740 380,780 350,790 350,770 360,760 350,750" fill="white" stroke="black" strokeWidth="2" />
              <text x="370" y="765" fontSize="18" textAnchor="middle" fill="black" fontWeight="bold">+</text>

              {/* PCTarget Adder */}
              <polygon points="1100,730 1130,740 1130,780 1100,790 1100,770 1110,760 1100,750" fill="white" stroke="black" strokeWidth="2" />
              <text x="1120" y="765" fontSize="18" textAnchor="middle" fill="black" fontWeight="bold">+</text>


              {/* ==========================================
                  MUXES
                  ========================================== */}
              {/* PC MUX */}
              <g transform="translate(100, 400)">
                <polygon points="0,0 20,15 20,65 0,80" fill="white" stroke="black" strokeWidth="2" />
                <text x="6" y="25" fontSize="14" fill="black">0</text>
                <text x="6" y="65" fontSize="14" fill="black">1</text>
              </g>

              {/* ALUSrc MUX */}
              <g transform="translate(1000, 450)">
                <polygon points="0,0 20,15 20,65 0,80" fill="white" stroke="black" strokeWidth="2" />
                <text x="6" y="25" fontSize="14" fill="black">0</text>
                <text x="6" y="65" fontSize="14" fill="black">1</text>
              </g>

              {/* Result MUX */}
              <g transform="translate(1500, 420)">
                <polygon points="0,0 20,15 20,65 0,80" fill="white" stroke="black" strokeWidth="2" />
                <text x="6" y="25" fontSize="14" fill="black">0</text>
                <text x="6" y="65" fontSize="14" fill="black">1</text>
              </g>


              {/* ==========================================
                  RUTAS Y CABLES (Wires)
                  ========================================== */}
              
              {/* PC Mux -> PC */}
              <path d="M 120 440 L 190 440" stroke={getWireColor(isRunning)} strokeWidth={getStrokeWidth(isRunning)} fill="none" markerEnd={isRunning ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <text x="160" y="430" fontSize="14" textAnchor="middle" fill="black">PCNext</text>
              {isRunning && <DataBadge x={160} y={460} value={toHex(s["PCNext"])} color="#2563eb" />}

              {/* PC -> Instr Mem & Adders */}
              <path d="M 230 430 L 340 430" stroke={getWireColor(isRunning)} strokeWidth={getStrokeWidth(isRunning)} fill="none" markerEnd={isRunning ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              {isRunning && <DataBadge x={285} y={410} value={toHex(model?.pc)} color="#2563eb" />}
              
              <path d="M 285 430 L 285 745 L 340 745" stroke={getWireColor(isRunning)} strokeWidth={getStrokeWidth(isRunning)} fill="none" markerEnd={isRunning ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <path d="M 285 745 L 285 700 L 1100 700" stroke={getWireColor(isRunning)} strokeWidth={getStrokeWidth(isRunning)} fill="none" markerEnd={isRunning ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />

              {/* 4 -> PCPlus4 Adder */}
              <text x="310" y="780" fontSize="14" fill="black">4</text>
              <path d="M 320 775 L 340 775" stroke="black" strokeWidth="1.5" fill="none" markerEnd="url(#arrowhead)" />
              
              {/* PCPlus4 Adder -> PC Mux 0 */}
              <path d="M 380 760 L 420 760 L 420 850 L 70 850 L 70 420 L 90 420" stroke={getWireColor(isRunning && !isBranch)} strokeWidth={getStrokeWidth(isRunning && !isBranch)} fill="none" markerEnd={isRunning && !isBranch ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <text x="440" y="840" fontSize="14" fill="black">PCPlus4</text>

              {/* ==========================================
                  BUS PRINCIPAL DE INSTR
                  ========================================== */}
              <path d="M 470 430 L 550 430" stroke={getWireColor(isRunning)} strokeWidth={getStrokeWidth(isRunning)} fill="none" />
              <text x="510" y="420" fontSize="14" textAnchor="middle" fill="black">Instr</text>
              {isRunning && <DataBadge x={510} y={455} value={toHex(s["Instr"])} color="#2563eb" />}

              {/* Vertical Bus */}
              <path d="M 550 150 L 550 775" stroke={getWireColor(isRunning)} strokeWidth={getStrokeWidth(isRunning)} fill="none" />

              {/* Taps hacia Control Unit */}
              <path d="M 550 150 L 690 150" stroke={getWireColor(isRunning)} strokeWidth={getStrokeWidth(isRunning)} fill="none" markerEnd={isRunning ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <text x="620" y="140" fontSize="14" textAnchor="middle" fill="black">6:0 op</text>
              
              <path d="M 550 190 L 690 190" stroke={getWireColor(isRunning)} strokeWidth={getStrokeWidth(isRunning)} fill="none" markerEnd={isRunning ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <text x="620" y="180" fontSize="14" textAnchor="middle" fill="black">14:12 funct3</text>

              <path d="M 550 230 L 690 230" stroke={getWireColor(isRunning)} strokeWidth={getStrokeWidth(isRunning)} fill="none" markerEnd={isRunning ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <text x="620" y="220" fontSize="14" textAnchor="middle" fill="black">30 funct7</text>

              {/* Taps hacia Register File */}
              <path d="M 550 420 L 740 420" stroke={getWireColor(isRunning)} strokeWidth={getStrokeWidth(isRunning)} fill="none" markerEnd={isRunning ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <text x="645" y="410" fontSize="14" textAnchor="middle" fill="black">19:15</text>
              
              <path d="M 550 480 L 740 480" stroke={getWireColor(isRunning)} strokeWidth={getStrokeWidth(isRunning)} fill="none" markerEnd={isRunning ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <text x="645" y="470" fontSize="14" textAnchor="middle" fill="black">24:20</text>
              
              <path d="M 550 540 L 740 540" stroke={getWireColor(isRunning)} strokeWidth={getStrokeWidth(isRunning)} fill="none" markerEnd={isRunning ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <text x="645" y="530" fontSize="14" textAnchor="middle" fill="black">11:7</text>

              {/* Tap hacia Extend */}
              <path d="M 550 775 L 740 775" stroke={getWireColor(isRunning)} strokeWidth={getStrokeWidth(isRunning)} fill="none" markerEnd={isRunning ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <text x="645" y="765" fontSize="14" textAnchor="middle" fill="black">31:7</text>

              {/* ========================================== */}

              {/* RF RD1 -> ALU A */}
              <path d="M 890 420 L 1090 420" stroke={getWireColor(isRunning)} strokeWidth={getStrokeWidth(isRunning)} fill="none" markerEnd={isRunning ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <text x="940" y="410" fontSize="14" textAnchor="middle" fill="black">SrcA</text>

              {/* RF RD2 -> MUX 0 & DataMem WD */}
              <path d="M 890 520 L 950 520 L 950 470 L 990 470" stroke={getWireColor(isRunning && !isALUSrc)} strokeWidth={getStrokeWidth(isRunning && !isALUSrc)} fill="none" markerEnd={isRunning && !isALUSrc ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <path d="M 950 520 L 950 540 L 1290 540" stroke={getWireColor(isRunning)} strokeWidth={getStrokeWidth(isRunning)} fill="none" markerEnd={isRunning ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <text x="1200" y="530" fontSize="14" fill="black">WriteData</text>
              {isRunning && <DataBadge x={1200} y={560} value={toHex(s["WriteData"])} color="#2563eb" />}

              {/* Extend -> MUX 1 & PCTarget Adder */}
              <path d="M 890 775 L 980 775" stroke={getWireColor(isRunning)} strokeWidth={getStrokeWidth(isRunning)} fill="none" />
              <text x="935" y="765" fontSize="14" textAnchor="middle" fill="black">ImmExt</text>
              {isRunning && <DataBadge x={935} y={800} value={toHex(s["ImmExt"])} color="#2563eb" />}
              
              <path d="M 980 775 L 980 510 L 990 510" stroke={getWireColor(isALUSrc)} strokeWidth={getStrokeWidth(isALUSrc)} fill="none" markerEnd={isALUSrc ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <path d="M 980 775 L 1090 775" stroke={getWireColor(isBranch)} strokeWidth={getStrokeWidth(isBranch)} fill="none" markerEnd={isBranch ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />

              {/* ALUSrc MUX -> ALU B */}
              <path d="M 1020 490 L 1090 490" stroke={getWireColor(isRunning)} strokeWidth={getStrokeWidth(isRunning)} fill="none" markerEnd={isRunning ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <text x="1055" y="480" fontSize="14" textAnchor="middle" fill="black">SrcB</text>

              {/* ALU -> DataMem & Result MUX 0 */}
              <path d="M 1150 440 L 1220 440" stroke={getWireColor(isRunning)} strokeWidth={getStrokeWidth(isRunning)} fill="none" />
              <text x="1185" y="430" fontSize="14" textAnchor="middle" fill="black">ALUResult</text>
              {isRunning && <DataBadge x={1185} y={465} value={toHex(s["ALUResult"])} color="#2563eb" />}

              <path d="M 1220 440 L 1290 440" stroke={getWireColor(isRunning)} strokeWidth={getStrokeWidth(isRunning)} fill="none" markerEnd={isRunning ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <path d="M 1220 440 L 1220 370 L 1490 370" stroke={getWireColor(isRunning && !isResultSrc)} strokeWidth={getStrokeWidth(isRunning && !isResultSrc)} fill="none" markerEnd={isRunning && !isResultSrc ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />

              {/* DataMem -> Result MUX 1 */}
              <path d="M 1420 440 L 1460 440 L 1460 480 L 1490 480" stroke={getWireColor(isResultSrc)} strokeWidth={getStrokeWidth(isResultSrc)} fill="none" markerEnd={isResultSrc ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <text x="1460" y="430" fontSize="14" textAnchor="middle" fill="black">ReadData</text>
              {isRunning && <DataBadge x={1460} y={505} value={toHex(s["ReadData"])} color="#2563eb" />}

              {/* Result MUX -> RegFile WD3 */}
              <path d="M 1520 460 L 1560 460 L 1560 900 L 700 900 L 700 560 L 740 560" stroke={getWireColor(isRegWrite)} strokeWidth={getStrokeWidth(isRegWrite)} fill="none" markerEnd={isRegWrite ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <text x="1540" y="450" fontSize="14" textAnchor="middle" fill="black">Result</text>
              {isRunning && <DataBadge x={1540} y={485} value={toHex(s["Result"])} color="#2563eb" />}

              {/* PCTarget Adder -> PC MUX 1 */}
              <path d="M 1130 760 L 1180 760 L 1180 950 L 50 950 L 50 460 L 90 460" stroke={getWireColor(isBranch)} strokeWidth={getStrokeWidth(isBranch)} fill="none" markerEnd={isBranch ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <text x="1155" y="750" fontSize="14" textAnchor="middle" fill="black">PCTarget</text>
              {isRunning && <DataBadge x={1155} y={785} value={toHex(s["PCTarget"])} color="#2563eb" />}

              {/* ALU Zero -> Control */}
              <path d="M 1150 400 L 1180 400 L 1180 300 L 720 300 L 720 280 L 740 280" stroke={getWireColor(isZero, "black")} strokeWidth={getStrokeWidth(isZero)} fill="none" markerEnd={isZero ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <text x="1165" y="390" fontSize="14" fill={getWireColor(isZero, "black")}>Zero</text>

              {/* ==========================================
                  CONTROL SIGNALS
                  ========================================== */}
              
              {/* PCSrc */}
              <path d="M 800 70 L 830 70 L 830 20 L 110 20 L 110 390" stroke={getWireColor(isBranch, "black")} strokeWidth={getStrokeWidth(isBranch)} fill="none" markerEnd={isBranch ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <text x="840" y="65" fontSize="14" fill={getWireColor(isBranch, "black")} fontWeight={isBranch ? "bold" : "normal"}>PCSrc</text>

              {/* ResultSrc */}
              <path d="M 800 100 L 1510 100 L 1510 410" stroke={getWireColor(isResultSrc, "black")} strokeWidth={getStrokeWidth(isResultSrc)} fill="none" markerEnd={isResultSrc ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <text x="840" y="95" fontSize="14" fill={getWireColor(isResultSrc, "black")} fontWeight={isResultSrc ? "bold" : "normal"}>ResultSrc</text>

              {/* MemWrite */}
              <path d="M 800 130 L 1360 130 L 1360 340" stroke={getWireColor(isMemWrite, "black")} strokeWidth={getStrokeWidth(isMemWrite)} fill="none" markerEnd={isMemWrite ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <text x="840" y="125" fontSize="14" fill={getWireColor(isMemWrite, "black")} fontWeight={isMemWrite ? "bold" : "normal"}>MemWrite</text>

              {/* ALUControl */}
              <path d="M 800 160 L 1130 160 L 1130 350" stroke={getWireColor(isRunning, "black")} strokeWidth={getStrokeWidth(isRunning)} fill="none" markerEnd={isRunning ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <text x="840" y="155" fontSize="14" fill={getWireColor(isRunning, "black")} fontWeight={isRunning ? "bold" : "normal"}>ALUControl<tspan fontSize="10" dy="5">2:0</tspan></text>

              {/* ALUSrc */}
              <path d="M 800 190 L 1010 190 L 1010 440" stroke={getWireColor(isALUSrc, "black")} strokeWidth={getStrokeWidth(isALUSrc)} fill="none" markerEnd={isALUSrc ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <text x="840" y="185" fontSize="14" fill={getWireColor(isALUSrc, "black")} fontWeight={isALUSrc ? "bold" : "normal"}>ALUSrc</text>

              {/* ImmSrc */}
              <path d="M 800 220 L 880 220 L 880 740" stroke={getWireColor(isRunning, "black")} strokeWidth={getStrokeWidth(isRunning)} fill="none" markerEnd={isRunning ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <text x="890" y="215" fontSize="14" fill={getWireColor(isRunning, "black")} fontWeight={isRunning ? "bold" : "normal"}>ImmSrc<tspan fontSize="10" dy="5">1:0</tspan></text>

              {/* RegWrite */}
              <path d="M 800 250 L 830 250 L 830 370" stroke={getWireColor(isRegWrite, "black")} strokeWidth={getStrokeWidth(isRegWrite)} fill="none" markerEnd={isRegWrite ? "url(#arrowhead-blue)" : "url(#arrowhead)"} />
              <text x="840" y="260" fontSize="14" fill={getWireColor(isRegWrite, "black")} fontWeight={isRegWrite ? "bold" : "normal"}>RegWrite</text>

            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
