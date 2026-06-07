import { https } from "../https";
import { RiscvModel } from "./model";
import { RiscvRunRequest, RiscvRunResponse } from "./type";

export class RiscvService {
  /**
   * Compila y ejecuta código ensamblador en el servidor Python.
   * @param codigo  Código fuente RISC-V ensamblador
   * @param maxSteps Límite de pasos de simulación (1–100_000, default 10_000)
   * @returns RiscvModel con registros, memoria y stats de ejecución
   */
  static async runCode(codigo: string, maxSteps = 10_000): Promise<RiscvModel> {
    try {
      const payload: RiscvRunRequest = { codigo, max_steps: maxSteps };
      const response = await https.post<RiscvRunResponse>("/run", payload);
      return new RiscvModel(response.data);
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw error;
    }
  }
}
