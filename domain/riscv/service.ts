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
  static async runCode(codigo: string, maxSteps = 10_000, architecture: "single_cycle" | "multi_cycle" | "pipeline" = "single_cycle"): Promise<RiscvModel> {
    try {
      const payload: RiscvRunRequest = { codigo, max_steps: maxSteps, architecture };
      const response = await https.post<RiscvRunResponse>("/run", payload);
      return new RiscvModel(response.data);
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw error;
    }
  }
  /**
   * Inicia una sesión interactiva de debug con el código ASM.
   */
  static async startDebugSession(codigo: string, architecture: "single_cycle" | "multi_cycle" | "pipeline" = "single_cycle"): Promise<RiscvModel> {
    try {
      const payload: RiscvRunRequest = { codigo, architecture };
      const response = await https.post<RiscvRunResponse>("/debug/start", payload);
      return new RiscvModel(response.data);
    } catch (error: any) {
      if (error.response?.data?.detail) throw new Error(error.response.data.detail);
      throw error;
    }
  }

  /**
   * Avanza 1 paso en la sesión interactiva.
   */
  static async stepSession(sessionId: string): Promise<RiscvModel> {
    try {
      const response = await https.post<RiscvRunResponse>(`/debug/step/${sessionId}`, {});
      return new RiscvModel(response.data);
    } catch (error: any) {
      if (error.response?.data?.detail) throw new Error(error.response.data.detail);
      throw error;
    }
  }

  /**
   * Retrocede 1 paso en la sesión interactiva.
   */
  static async stepBackSession(sessionId: string): Promise<RiscvModel> {
    try {
      const response = await https.post<RiscvRunResponse>(`/debug/step_back/${sessionId}`, {});
      return new RiscvModel(response.data);
    } catch (error: any) {
      if (error.response?.data?.detail) throw new Error(error.response.data.detail);
      throw error;
    }
  }

  /**
   * Termina la sesión y libera memoria en el backend.
   */
  static async stopSession(sessionId: string): Promise<void> {
    try {
      await https.delete(`/debug/${sessionId}`);
    } catch (error: any) {
      console.error("Error stopping session:", error);
    }
  }

  /**
   * Sube un archivo .bin y comienza una sesión interactiva.
   */
  static async uploadBinFile(file: File, architecture: "single_cycle" | "multi_cycle" | "pipeline" = "single_cycle"): Promise<RiscvModel> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("architecture", architecture);
      
      const response = await https.post<RiscvRunResponse>("/upload_bin", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return new RiscvModel(response.data);
    } catch (error: any) {
      if (error.response?.data?.detail) throw new Error(error.response.data.detail);
      throw error;
    }
  }
}
