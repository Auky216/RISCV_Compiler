import { https } from "../https";
import { RiscvModel } from "./model";
import { RiscvRunRequest, RiscvRunResponse } from "./type";

export class RiscvService {
  /**
   * Compila y ejecuta código ensamblador en el servidor Python.
   * @param codigo El código fuente RISC-V ensamblador
   * @returns Un objeto RiscvModel con el estado completo de la CPU
   */
  static async runCode(codigo: string): Promise<RiscvModel> {
    try {
      const payload: RiscvRunRequest = { codigo };
      const response = await https.post<RiscvRunResponse>('/run', payload);
      return new RiscvModel(response.data);
    } catch (error: any) {
      // Extraemos el detalle del error que manda FastAPI
      if (error.response && error.response.data && error.response.data.detail) {
        throw new Error(error.response.data.detail);
      }
      throw error;
    }
  }
}
