export interface RiscvRunRequest {
  codigo: string;
}

export interface RiscvRunResponse {
  status: string;
  steps_executed: number;
  hit_limit: boolean;
  registers: number[];
}
