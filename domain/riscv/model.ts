import { RiscvRunResponse } from "./type";

export const ABI_NAMES = [
  "zero", "ra", "sp", "gp", "tp", "t0", "t1", "t2",
  "s0/fp", "s1", "a0", "a1", "a2", "a3", "a4", "a5",
  "a6", "a7", "s2", "s3", "s4", "s5", "s6", "s7",
  "s8", "s9", "s10", "s11", "t3", "t4", "t5", "t6"
];

export class RiscvModel {
  public status: string;
  public stepsExecuted: number;
  public hitLimit: boolean;
  public registers: number[];

  constructor(data: RiscvRunResponse) {
    this.status = data.status;
    this.stepsExecuted = data.steps_executed;
    this.hitLimit = data.hit_limit;
    this.registers = data.registers || Array(32).fill(0);
  }

  /**
   * Obtiene el nombre del registro según el ABI de RISC-V (ej. a0, t0, sp)
   */
  getAbiName(index: number): string {
    return ABI_NAMES[index] || `x${index}`;
  }

  /**
   * Convierte el valor decimal del registro a formato Hexadecimal de 32 bits.
   */
  getHexValue(index: number): string {
    const val = this.registers[index];
    const unsigned = val >>> 0; // Convert to unsigned 32-bit
    return "0x" + unsigned.toString(16).padStart(8, '0').toUpperCase();
  }
  
  /**
   * Retorna true si la compilación y ejecución fueron exitosas.
   */
  isSuccessful(): boolean {
    return this.status === "success";
  }

  /**
   * Retorna true si el registro en el índice indicado fue modificado 
   * (suponiendo que el estado inicial era 0).
   */
  isChanged(index: number): boolean {
    return this.registers[index] !== 0;
  }
}
