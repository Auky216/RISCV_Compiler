"""
routers/riscv.py — Endpoints relacionados al compilador y simulador RISC-V.

POST /api/run  — Compila y simula. Devuelve registros + snapshot de memoria.
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
from typing import Optional, Dict
import uuid

from riscv_core.compiler import CompiladorRISCV
from riscv_core.simulator import SimuladorRISCV

router = APIRouter(prefix="", tags=["RISC-V"])

# Límite por defecto (el cliente puede sobreescribirlo hasta 100_000)
DEFAULT_MAX_STEPS = 10_000
HARD_MAX_STEPS   = 100_000
# Cuántos bytes de memoria enviamos al frontend (primeros 4 KB)
MEMORY_SNAPSHOT_BYTES = 4 * 1024  # 4 KB

# Estructura in-memory para el debugger
class DebugSession:
    def __init__(self, sim: SimuladorRISCV, program_size: int):
        self.sim = sim
        self.program_size = program_size
        self.steps_executed = 0
        self.is_finished = False

debug_sessions: Dict[str, DebugSession] = {}


class RunRequest(BaseModel):
    codigo: str
    max_steps: Optional[int] = Field(
        default=DEFAULT_MAX_STEPS,
        ge=1,
        le=HARD_MAX_STEPS,
        description="Número máximo de pasos de simulación (1–100 000)",
    )


@router.post("/run", summary="Compila y simula código ensamblador RISC-V")
def run_code(req: RunRequest):
    """
    1. Compila el código ASM con el ensamblador de 2 pasadas.
    2. Carga el binario en memoria y simula hasta `max_steps` pasos.
    3. Devuelve registros, snapshot de los primeros 4 KB de memoria y stats.
    """
    compilador = CompiladorRISCV()
    sim        = SimuladorRISCV()
    bytes_totales = bytearray()

    # ── 1. Compilación ──────────────────────────────────────────────────────
    try:
        instrucciones_hex = compilador.compile_program(req.codigo)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    for hex_str in instrucciones_hex:
        bytes_crudos = bytes.fromhex(hex_str[2:])[::-1]
        bytes_totales.extend(bytes_crudos)

    if len(bytes_totales) > len(sim.memoria):
        raise HTTPException(
            status_code=400,
            detail="El programa ensamblado excede la memoria disponible.",
        )

    if len(bytes_totales) == 0:
        return {
            "status": "success",
            "steps_executed": 0,
            "hit_limit": False,
            "registers": [0] * 32,
            "memory": list(sim.memoria[:MEMORY_SNAPSHOT_BYTES]),
            "program_size": 0,
        }

    # ── 2. Carga en memoria ──────────────────────────────────────────────────
    sim.memoria[0:len(bytes_totales)] = bytes_totales
    sim.pc = 0

    # ── 3. Ejecución ─────────────────────────────────────────────────────────
    max_steps = req.max_steps or DEFAULT_MAX_STEPS
    pasos_ejecutados = 0
    try:
        while pasos_ejecutados < max_steps:
            b0 = sim.memoria[sim.pc]
            b1 = sim.memoria[sim.pc + 1]
            b2 = sim.memoria[sim.pc + 2]
            b3 = sim.memoria[sim.pc + 3]
            instruccion = (b3 << 24) | (b2 << 16) | (b1 << 8) | b0
            if instruccion == 0:
                break
            sim.step()
            pasos_ejecutados += 1
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Falla de ejecución en la CPU: {e}")

    terminado_por_limite = pasos_ejecutados == max_steps

    # ── 4. Extracción de resultados ──────────────────────────────────────────
    registros = [sim.leer_registro(i) for i in range(32)]

    # Snapshot de los primeros MEMORY_SNAPSHOT_BYTES bytes de memoria
    memory_snapshot = list(sim.memoria[:MEMORY_SNAPSHOT_BYTES])

    return {
        "status":         "success",
        "steps_executed": pasos_ejecutados,
        "hit_limit":      terminado_por_limite,
        "registers":      registros,
        "memory":         memory_snapshot,
        "program_size":   len(bytes_totales),
    }

# =========================================================
# ENDPOINTS PARA DEBUG PASO A PASO
# =========================================================

def extract_state(session: DebugSession, session_id: str):
    return {
        "status": "success",
        "session_id": session_id,
        "steps_executed": session.steps_executed,
        "hit_limit": False, # En paso a paso no se usa el límite global
        "is_finished": session.is_finished,
        "registers": [session.sim.leer_registro(i) for i in range(32)],
        "memory": list(session.sim.memoria[:MEMORY_SNAPSHOT_BYTES]),
        "program_size": session.program_size,
    }

@router.post("/debug/start", summary="Inicia una sesión de debug con código ASM")
def debug_start(req: RunRequest):
    compilador = CompiladorRISCV()
    sim = SimuladorRISCV()
    bytes_totales = bytearray()

    try:
        instrucciones_hex = compilador.compile_program(req.codigo)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    for hex_str in instrucciones_hex:
        bytes_totales.extend(bytes.fromhex(hex_str[2:])[::-1])

    if len(bytes_totales) > len(sim.memoria):
        raise HTTPException(status_code=400, detail="Programa excede la memoria.")

    sim.memoria[0:len(bytes_totales)] = bytes_totales
    sim.pc = 0

    session_id = str(uuid.uuid4())
    debug_sessions[session_id] = DebugSession(sim, len(bytes_totales))
    
    return extract_state(debug_sessions[session_id], session_id)

@router.post("/debug/step/{session_id}", summary="Avanza 1 paso en la sesión")
def debug_step(session_id: str):
    if session_id not in debug_sessions:
        raise HTTPException(status_code=404, detail="Sesión no encontrada o expirada.")
    
    session = debug_sessions[session_id]
    if session.is_finished:
        return extract_state(session, session_id)

    try:
        b0 = session.sim.memoria[session.sim.pc]
        b1 = session.sim.memoria[session.sim.pc + 1]
        b2 = session.sim.memoria[session.sim.pc + 2]
        b3 = session.sim.memoria[session.sim.pc + 3]
        instruccion = (b3 << 24) | (b2 << 16) | (b1 << 8) | b0
        
        if instruccion == 0:
            session.is_finished = True
        else:
            session.sim.step()
            session.steps_executed += 1
            
    except Exception as e:
        session.is_finished = True
        raise HTTPException(status_code=400, detail=f"Falla de ejecución: {e}")

    return extract_state(session, session_id)

@router.delete("/debug/{session_id}", summary="Termina una sesión de debug")
def debug_stop(session_id: str):
    if session_id in debug_sessions:
        del debug_sessions[session_id]
    return {"status": "success", "message": "Sesión terminada."}

# =========================================================
# ENDPOINTS PARA ARCHIVOS .BIN
# =========================================================

@router.post("/upload_bin", summary="Carga un archivo .bin e inicia sesión de debug")
def upload_bin(file: UploadFile = File(...)):
    if not file.filename.endswith(".bin"):
        raise HTTPException(status_code=400, detail="El archivo debe tener extensión .bin")
    
    bytes_leidos = file.file.read()
    if len(bytes_leidos) == 0:
        raise HTTPException(status_code=400, detail="El archivo está vacío.")
        
    sim = SimuladorRISCV()
    if len(bytes_leidos) > len(sim.memoria):
        raise HTTPException(status_code=400, detail="Programa excede la memoria.")
        
    sim.memoria[0:len(bytes_leidos)] = bytes_leidos
    sim.pc = 0

    session_id = str(uuid.uuid4())
    debug_sessions[session_id] = DebugSession(sim, len(bytes_leidos))
    
    return extract_state(debug_sessions[session_id], session_id)

