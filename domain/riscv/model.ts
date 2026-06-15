import { RiscvRunResponse } from "./type";

export const ABI_NAMES = [
  "zero", "ra",  "sp",   "gp",  "tp", "t0", "t1", "t2",
  "s0/fp","s1",  "a0",   "a1",  "a2", "a3", "a4", "a5",
  "a6",   "a7",  "s2",   "s3",  "s4", "s5", "s6", "s7",
  "s8",   "s9",  "s10",  "s11", "t3", "t4", "t5", "t6",
];

export class RiscvModel {
  public status: string;
  public stepsExecuted: number;
  public hitLimit: boolean;
  public registers: number[];
  public memory: number[];
  public programSize: number;
  public sessionId?: string;
  public isFinished?: boolean;
  public pc?: number;
  public currentLine?: number;
  public controlSignals: Record<string, number> | null;

  constructor(data: RiscvRunResponse) {
    this.status       = data.status;
    this.stepsExecuted = data.steps_executed;
    this.hitLimit     = data.hit_limit;
    this.registers    = data.registers    || Array(32).fill(0);
    this.memory       = data.memory       || Array(4096).fill(0);
    this.programSize  = data.program_size || 0;
    this.sessionId    = data.session_id;
    this.isFinished   = data.is_finished;
    this.pc           = data.pc;
    this.currentLine  = data.current_line;
    this.controlSignals = data.control_signals ?? null;
  }

  /** Nombre ABI del registro (ej. "a0", "sp") */
  getAbiName(index: number): string {
    return ABI_NAMES[index] || `x${index}`;
  }

  /** Valor del registro en hex de 32 bits (unsigned) */
  getHexValue(index: number): string {
    const unsigned = this.registers[index] >>> 0;
    return "0x" + unsigned.toString(16).padStart(8, "0").toUpperCase();
  }

  /** Valor del registro en decimal con signo */
  getDecValue(index: number): string {
    const signed = this.registers[index] | 0; // signed 32-bit
    return signed.toString();
  }

  /** true si el registro fue modificado (asumiendo estado inicial = 0) */
  isChanged(index: number): boolean {
    return this.registers[index] !== 0;
  }

  isSuccessful(): boolean {
    return this.status === "success";
  }

  /**
   * Devuelve un dump de memoria como filas de 16 bytes.
   * Cada fila: { address, bytes: number[], ascii: string }
   */
  getMemoryRows(
    startAddr = 0,
    length = this.memory.length,
    bytesPerRow = 16
  ): { address: number; bytes: number[]; ascii: string }[] {
    const rows = [];
    const end = Math.min(startAddr + length, this.memory.length);
    for (let addr = startAddr; addr < end; addr += bytesPerRow) {
      const bytes = this.memory.slice(addr, addr + bytesPerRow);
      const ascii = bytes
        .map((b) => (b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : "."))
        .join("");
      rows.push({ address: addr, bytes, ascii });
    }
    return rows;
  }

  /** Devuelve el rango de memoria donde el programa fue cargado (0..programSize) */
  getProgramRange(): { start: number; end: number } {
    return { start: 0, end: this.programSize };
  }
}
