"""
routers/riscv.py — Endpoints relacionados al compilador y simulador RISC-V.

POST /api/run  — Compila y simula. Devuelve registros + snapshot de memoria.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from riscv_core.compiler import CompiladorRISCV
from riscv_core.simulator import SimuladorRISCV

router = APIRouter(prefix="", tags=["RISC-V"])

# Límite por defecto (el cliente puede sobreescribirlo hasta 100_000)
DEFAULT_MAX_STEPS = 10_000
HARD_MAX_STEPS   = 100_000
# Cuántos bytes de memoria enviamos al frontend (primeros 4 KB)
MEMORY_SNAPSHOT_BYTES = 4 * 1024  # 4 KB


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
