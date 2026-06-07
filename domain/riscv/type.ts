export interface RiscvRunRequest {
  codigo: string;
  max_steps?: number; // 1–100_000, default 10_000
}

export interface RiscvRunResponse {
  status: string;
  steps_executed: number;
  hit_limit: boolean;
  registers: number[];
  memory: number[];       // Snapshot de los primeros 4 KB (4096 bytes)
  program_size: number;   // Tamaño del binario compilado en bytes
}
