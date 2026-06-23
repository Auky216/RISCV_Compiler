"use client";

import React from "react";
import { RiscvModel } from "@/domain/riscv/model";

interface TruthTablePanelProps {
  model: RiscvModel | null;
}

export function TruthTablePanel({ model }: TruthTablePanelProps) {
  const s = model?.controlSignals || {};
  const instr = s["Instr"] || 0;
  const opcode = instr & 0x7F;

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
    return isActive ? "bg-red-50 text-red-600 font-bold" : "text-on-surface bg-white";
  };

  const isActiveOpcode = (rowOpcodeStr: string) => {
    return model !== null && !model.isFinished && opcode === parseInt(rowOpcodeStr, 2);
  };

  // Determinar la fila activa del ALU Decoder
  // Para hacerlo perfecto, evaluamos el estado actual si coincide
  const isActiveAluDecoder = (row: any) => {
    if (model === null || model.isFinished) return false;
    // Si el opcode activo concuerda con el ALUOp esperado
    const isRType = opcode === 51; // 0110011
    const isIType = opcode === 19; // 0010011
    const isLwSw = opcode === 3 || opcode === 35; // 0000011, 0100011
    const isBeq = opcode === 99; // 1100011
    
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
      const val = `${op5}${funct7_5}`; // 00, 01, 10, 11
      if (row.op_funct7 === "11") return val === "11";
      return val === "00" || val === "01" || val === "10";
    }
    
    return true; // para los otros funct3
  };

  return (
    <div className="flex-1 overflow-auto p-8 bg-surface-container-lowest flex flex-col items-center">
      <h2 className="text-xl font-bold mb-2 text-black text-center">Table 1. Main Decoder Truth Table</h2>
      <div className="border-2 border-black w-full max-w-5xl mb-12">
        <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 border-2 border-black bg-[#0070C0] text-white font-bold text-center">Instruction</th>
              <th className="px-4 py-2 border-2 border-black bg-[#0070C0] text-white font-bold text-center">Opcode</th>
              <th className="px-4 py-2 border-2 border-black bg-[#0070C0] text-white font-bold text-center">RegWrite</th>
              <th className="px-4 py-2 border-2 border-black bg-[#0070C0] text-white font-bold text-center">ImmSrc</th>
              <th className="px-4 py-2 border-2 border-black bg-[#0070C0] text-white font-bold text-center">ALUSrcA</th>
              <th className="px-4 py-2 border-2 border-black bg-[#0070C0] text-white font-bold text-center">ALUSrcB</th>
              <th className="px-4 py-2 border-2 border-black bg-[#0070C0] text-white font-bold text-center">MemWrite</th>
              <th className="px-4 py-2 border-2 border-black bg-[#0070C0] text-white font-bold text-center">ResultSrc</th>
              <th className="px-4 py-2 border-2 border-black bg-[#0070C0] text-white font-bold text-center">Branch</th>
              <th className="px-4 py-2 border-2 border-black bg-[#0070C0] text-white font-bold text-center">ALUOp</th>
              <th className="px-4 py-2 border-2 border-black bg-[#0070C0] text-white font-bold text-center">Jump</th>
            </tr>
          </thead>
          <tbody>
            {mainControlRows.map((row, i) => {
              const active = isActiveOpcode(row.Opcode);
              return (
                <tr key={i} className={getRowClass(active)}>
                  <td className="px-4 py-1 border-2 border-black font-mono">{row.Instruction}</td>
                  <td className="px-4 py-1 border-2 border-black font-mono text-center">{row.Opcode}</td>
                  <td className="px-4 py-1 border-2 border-black text-center">{row.RegWrite}</td>
                  <td className="px-4 py-1 border-2 border-black text-center">{row.ImmSrc}</td>
                  <td className="px-4 py-1 border-2 border-black text-center">{row.ALUSrcA}</td>
                  <td className="px-4 py-1 border-2 border-black text-center">{row.ALUSrcB}</td>
                  <td className="px-4 py-1 border-2 border-black text-center">{row.MemWrite}</td>
                  <td className="px-4 py-1 border-2 border-black text-center">{row.ResultSrc}</td>
                  <td className="px-4 py-1 border-2 border-black text-center">{row.Branch}</td>
                  <td className="px-4 py-1 border-2 border-black text-center">{row.ALUOp}</td>
                  <td className="px-4 py-1 border-2 border-black text-center">{row.Jump}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-bold mb-2 text-black text-center">Table 2. ALU Decoder Truth Table</h2>
      <div className="border-2 border-black w-full max-w-3xl">
        <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 border-2 border-black bg-[#0070C0] text-white font-bold italic">ALUOp<sub className="text-[10px] not-italic">1:0</sub></th>
              <th className="px-4 py-2 border-2 border-black bg-[#0070C0] text-white font-bold italic">funct3<sub className="text-[10px] not-italic">2:0</sub></th>
              <th className="px-4 py-2 border-2 border-black bg-[#0070C0] text-white font-bold italic">&#123;op<sub className="text-[10px] not-italic">5</sub>, funct7<sub className="text-[10px] not-italic">5</sub>&#125;</th>
              <th className="px-4 py-2 border-2 border-black bg-[#0070C0] text-white font-bold italic">ALUControl<sub className="text-[10px] not-italic">2:0</sub></th>
              <th className="px-4 py-2 border-2 border-black bg-[#0070C0] text-white font-bold">Operation</th>
            </tr>
          </thead>
          <tbody>
            {aluDecoderRows.map((row, i) => {
              const active = isActiveAluDecoder(row);
              return (
                <tr key={i} className={getRowClass(active)}>
                  <td className="px-4 py-1 border-2 border-black font-mono">{row.ALUOp}</td>
                  <td className="px-4 py-1 border-2 border-black font-mono text-center">{row.funct3}</td>
                  <td className="px-4 py-1 border-2 border-black font-mono text-center">{row.op_funct7}</td>
                  <td className="px-4 py-1 border-2 border-black font-mono text-center">{row.ALUControl}</td>
                  <td className="px-4 py-1 border-2 border-black">{row.Operation}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
