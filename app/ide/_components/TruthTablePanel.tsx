"use client";

import React, { useState, useRef } from "react";
import { RiscvModel } from "@/domain/riscv/model";

interface TruthTablePanelProps {
  model: RiscvModel | null;
}

export function TruthTablePanel({ model }: TruthTablePanelProps) {
  const s = model?.controlSignals || {};
  const instr = s["Instr"] || 0;
  const opcode = instr & 0x7F;

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

  const mainControlRows = [
    { Instruction: "lw", Opcode: "0000011", RegWrite: "1", ImmSrc: "00", ALUSrcA: "0", ALUSrcB: "1", MemWrite: "0", ResultSrc: "01", Branch: "0", ALUOp: "00", Jump: "0" },
    { Instruction: "sw", Opcode: "0100011", RegWrite: "0", ImmSrc: "01", ALUSrcA: "0", ALUSrcB: "1", MemWrite: "1", ResultSrc: "xx", Branch: "0", ALUOp: "00", Jump: "0" },
    { Instruction: "R-type", Opcode: "0110011", RegWrite: "1", ImmSrc: "xx", ALUSrcA: "0", ALUSrcB: "0", MemWrite: "0", ResultSrc: "00", Branch: "0", ALUOp: "10", Jump: "0" },
    { Instruction: "beq", Opcode: "1100011", RegWrite: "0", ImmSrc: "10", ALUSrcA: "0", ALUSrcB: "0", MemWrite: "0", ResultSrc: "xx", Branch: "1", ALUOp: "01", Jump: "0" },
    { Instruction: "I-type ALU", Opcode: "0010011", RegWrite: "1", ImmSrc: "00", ALUSrcA: "0", ALUSrcB: "1", MemWrite: "0", ResultSrc: "00", Branch: "0", ALUOp: "10", Jump: "0" },
    { Instruction: "jal", Opcode: "1101111", RegWrite: "1", ImmSrc: "11", ALUSrcA: "x", ALUSrcB: "x", MemWrite: "0", ResultSrc: "10", Branch: "0", ALUOp: "xx", Jump: "1" },
  ];

  const aluDecoderRows = [
    { ALUOp: "00", funct3: "x", op_funct7: "x", ALUControl: "000", Operation: "Add" },
    { ALUOp: "01", funct3: "x", op_funct7: "x", ALUControl: "001", Operation: "Subtract" },
    { ALUOp: "10", funct3: "000", op_funct7: "00, 01, 10", ALUControl: "000", Operation: "Add" },
    { ALUOp: "10", funct3: "000", op_funct7: "11", ALUControl: "001", Operation: "Subtract" },
    { ALUOp: "10", funct3: "010", op_funct7: "x", ALUControl: "101", Operation: "SLT" },
    { ALUOp: "10", funct3: "110", op_funct7: "x", ALUControl: "011", Operation: "OR" },
    { ALUOp: "10", funct3: "111", op_funct7: "x", ALUControl: "010", Operation: "AND" },
  ];

  const getRowClass = (isActive: boolean) => {
    return isActive ? "bg-primary text-background font-bold shadow-[inset_0_0_8px_rgba(0,0,0,0.5)]" : "text-primary bg-background";
  };

  const isActiveOpcode = (rowOpcodeStr: string) => {
    return model !== null && !model.isFinished && opcode === parseInt(rowOpcodeStr, 2);
  };

  const isActiveAluDecoder = (row: any) => {
    if (model === null || model.isFinished) return false;
    const isRType = opcode === 51;
    const isIType = opcode === 19;
    const isLwSw = opcode === 3 || opcode === 35;
    const isBeq = opcode === 99;
    
    let currentALUOp = "xx";
    if (isLwSw) currentALUOp = "00";
    else if (isBeq) currentALUOp = "01";
    else if (isRType || isIType) currentALUOp = "10";
    
    if (row.ALUOp !== currentALUOp) return false;
    if (currentALUOp === "00" || currentALUOp === "01") return true;
    
    const funct3Str = ((instr >> 12) & 0x7).toString(2).padStart(3, "0");
    if (row.funct3 !== funct3Str) return false;
    
    if (funct3Str === "000") {
      const op5 = (opcode >> 5) & 1;
      const funct7_5 = (instr >> 30) & 1;
      const val = `${op5}${funct7_5}`;
      if (row.op_funct7 === "11") return val === "11";
      return val === "00" || val === "01" || val === "10";
    }
    
    return true;
  };

  return (
    <div className="flex-1 w-full h-full bg-background relative overflow-hidden flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-background border-b-2 border-primary gap-4 flex-shrink-0 shadow-[0_2px_0_var(--color-primary)] z-10">
        <div className="flex items-center gap-4">
          <span className="font-pixel-title text-xs text-primary uppercase">
            TABLAS DE VERDAD DE CONTROL / CONTROL TRUTH TABLES
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
          className="w-full h-full flex flex-col items-center justify-center pt-8"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.1s ease-out"
          }}
        >
          <div className="flex flex-col items-center pointer-events-none p-8 bg-background border-2 border-primary shadow-[2px_2px_0_var(--color-primary)]">
            <h2 className="text-xs font-pixel-title mb-4 text-center uppercase bg-primary text-background px-3 py-2 inline-block border-2 border-primary">Tabla 1: Decodificador Principal (Main Decoder)</h2>
            <div className="border-2 border-primary w-full max-w-5xl mb-12 bg-primary p-1">
        <table className="w-full text-left text-sm whitespace-nowrap border-collapse bg-background">
          <thead>
            <tr>
              <th className="px-3 py-1.5 border-2 border-primary bg-primary text-background font-pixel-title text-[10px] uppercase text-center">Instruction</th>
              <th className="px-3 py-1.5 border-2 border-primary bg-primary text-background font-pixel-title text-[10px] uppercase text-center">Opcode</th>
              <th className="px-3 py-1.5 border-2 border-primary bg-primary text-background font-pixel-title text-[10px] uppercase text-center">RegWrite</th>
              <th className="px-3 py-1.5 border-2 border-primary bg-primary text-background font-pixel-title text-[10px] uppercase text-center">ImmSrc</th>
              <th className="px-3 py-1.5 border-2 border-primary bg-primary text-background font-pixel-title text-[10px] uppercase text-center">ALUSrcA</th>
              <th className="px-3 py-1.5 border-2 border-primary bg-primary text-background font-pixel-title text-[10px] uppercase text-center">ALUSrcB</th>
              <th className="px-3 py-1.5 border-2 border-primary bg-primary text-background font-pixel-title text-[10px] uppercase text-center">MemWrite</th>
              <th className="px-3 py-1.5 border-2 border-primary bg-primary text-background font-pixel-title text-[10px] uppercase text-center">ResultSrc</th>
              <th className="px-3 py-1.5 border-2 border-primary bg-primary text-background font-pixel-title text-[10px] uppercase text-center">Branch</th>
              <th className="px-3 py-1.5 border-2 border-primary bg-primary text-background font-pixel-title text-[10px] uppercase text-center">ALUOp</th>
              <th className="px-3 py-1.5 border-2 border-primary bg-primary text-background font-pixel-title text-[10px] uppercase text-center">Jump</th>
            </tr>
          </thead>
          <tbody>
            {mainControlRows.map((row, i) => {
              const active = isActiveOpcode(row.Opcode);
              return (
                <tr key={i} className={getRowClass(active)}>
                  <td className="px-3 py-1.5 border-[1px] border-primary font-mono uppercase">{row.Instruction}</td>
                  <td className="px-3 py-1.5 border-[1px] border-primary font-mono text-center">{row.Opcode}</td>
                  <td className="px-3 py-1.5 border-[1px] border-primary text-center">{row.RegWrite}</td>
                  <td className="px-3 py-1.5 border-[1px] border-primary text-center">{row.ImmSrc}</td>
                  <td className="px-3 py-1.5 border-[1px] border-primary text-center">{row.ALUSrcA}</td>
                  <td className="px-3 py-1.5 border-[1px] border-primary text-center">{row.ALUSrcB}</td>
                  <td className="px-3 py-1.5 border-[1px] border-primary text-center">{row.MemWrite}</td>
                  <td className="px-3 py-1.5 border-[1px] border-primary text-center">{row.ResultSrc}</td>
                  <td className="px-3 py-1.5 border-[1px] border-primary text-center">{row.Branch}</td>
                  <td className="px-3 py-1.5 border-[1px] border-primary text-center">{row.ALUOp}</td>
                  <td className="px-3 py-1.5 border-[1px] border-primary text-center">{row.Jump}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="text-xs font-pixel-title mb-4 text-center uppercase bg-primary text-background px-3 py-2 inline-block border-2 border-primary">Tabla 2: Decodificador de ALU (ALU Decoder)</h2>
      <div className="border-2 border-primary w-full max-w-3xl bg-primary p-1">
        <table className="w-full text-left text-sm whitespace-nowrap border-collapse bg-background">
          <thead>
            <tr>
              <th className="px-3 py-1.5 border-2 border-primary bg-primary text-background font-pixel-title text-[10px] uppercase text-center">ALUOp<sub className="text-[8px] ml-1">1:0</sub></th>
              <th className="px-3 py-1.5 border-2 border-primary bg-primary text-background font-pixel-title text-[10px] uppercase text-center">funct3<sub className="text-[8px] ml-1">2:0</sub></th>
              <th className="px-3 py-1.5 border-2 border-primary bg-primary text-background font-pixel-title text-[10px] uppercase text-center">&#123;op<sub className="text-[8px] mx-1">5</sub>, funct7<sub className="text-[8px] mx-1">5</sub>&#125;</th>
              <th className="px-3 py-1.5 border-2 border-primary bg-primary text-background font-pixel-title text-[10px] uppercase text-center">ALUControl<sub className="text-[8px] ml-1">2:0</sub></th>
              <th className="px-3 py-1.5 border-2 border-primary bg-primary text-background font-pixel-title text-[10px] uppercase text-center">Operation</th>
            </tr>
          </thead>
          <tbody>
            {aluDecoderRows.map((row, i) => {
              const active = isActiveAluDecoder(row);
              return (
                <tr key={i} className={getRowClass(active)}>
                  <td className="px-3 py-1.5 border-[1px] border-primary font-mono text-center">{row.ALUOp}</td>
                  <td className="px-3 py-1.5 border-[1px] border-primary font-mono text-center">{row.funct3}</td>
                  <td className="px-3 py-1.5 border-[1px] border-primary font-mono text-center">{row.op_funct7}</td>
                  <td className="px-3 py-1.5 border-[1px] border-primary font-mono text-center">{row.ALUControl}</td>
                  <td className="px-3 py-1.5 border-[1px] border-primary font-mono uppercase text-center">{row.Operation}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
          </div>
        </div>
      </div>
    </div>
  );
}
