"""
routers/riscv.py — Endpoints relacionados al simulador RISC-V.

Utiliza inyección de estado para simular usando los componentes modulares puros
del hardware ubicado en `riscv_core.single_cycle` sin modificar sus archivos.
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import Optional, Dict
import uuid
import sys
import os
from pathlib import Path

# Añadimos single_cycle al PYTHONPATH para que los import locales del hardware (ej. `from mux2 import MUX2`) funcionen
project_root = Path(__file__).resolve().parent.parent.parent
single_cycle_dir = project_root / "riscv_core" / "single_cycle"
if str(single_cycle_dir) not in sys.path:
    sys.path.insert(0, str(single_cycle_dir))

# Importamos los modulos del hardware "como son"
import riscv_core.single_cycle.data_memory as sc_dmem
import riscv_core.single_cycle.instruction_memory as sc_imem
import riscv_core.single_cycle.register_file as sc_reg
from riscv_core.single_cycle.control_unit import CONTROL_UNIT
from riscv_core.single_cycle.datapath import DATAPATH
from riscv_core.single_cycle.flopr import FLOPR
from riscv_core.single_cycle.mux2 import MUX2

from compiler.compiler import CompiladorRISCV

router = APIRouter(prefix="", tags=["RISC-V"])

DEFAULT_MAX_STEPS = 10_000
MEMORY_SNAPSHOT_BYTES = 4096

class DebugSession:
    def __init__(self, program_bytes: bytearray, architecture: str, pc_to_line_map: dict = None):
        self.architecture = architecture
        self.program_size = len(program_bytes)
        self.steps_executed = 0
        self.is_finished = False
        self.pc = 0
        self.pc_to_line_map = pc_to_line_map or {}
        self.registers = [0] * 32
        self.memory = bytearray(8192) # 8KB de memoria para el backend
        self.history = [] # Historial para poder retroceder
        self.control_signals = {} # Para iluminar el SVG Datapath
        
        # Copiamos el programa al inicio de la memoria
        size = min(len(program_bytes), len(self.memory))
        self.memory[0:size] = program_bytes[:size]

debug_sessions: Dict[str, DebugSession] = {}

class RunRequest(BaseModel):
    codigo: str
    max_steps: Optional[int] = Field(default=DEFAULT_MAX_STEPS)
    architecture: str = "single_cycle"

def inject_state(session: DebugSession):
    """Inyecta el estado de la sesión web en las variables globales del hardware."""
    if session.architecture == "single_cycle":
        sc_reg.rf = list(session.registers)
        
        # El hardware de la Tarea asume arreglos de palabras de 32-bits (RAM[64]).
        # Convertimos nuestro bytearray plano (little-endian) a enteros de 32-bits.
        sc_imem.RAM = [0] * 64
        sc_dmem.RAM = [0] * 64
        for i in range(64):
            offset = i * 4
            word = int.from_bytes(session.memory[offset:offset+4], byteorder='little', signed=False)
            sc_imem.RAM[i] = word
            sc_dmem.RAM[i] = word

def extract_state(session: DebugSession):
    """Extrae el estado de las variables globales del hardware de vuelta a la sesión web."""
    if session.architecture == "single_cycle":
        session.registers = list(sc_reg.rf)
        
        # Re-convertimos la RAM del hardware de vuelta a bytes para el frontend
        for i in range(64):
            word = sc_dmem.RAM[i] & 0xFFFFFFFF
            session.memory[i*4 : i*4+4] = word.to_bytes(4, byteorder='little')

def execute_single_cycle_step(session: DebugSession):
    """Emula un ciclo de reloj llamando a los módulos del hardware."""
    Instr = sc_imem.INSTRUCTION_MEMORY(session.pc)
    
    # Condición de paro simulada (instrucción 0x0)
    if Instr == 0:
        session.is_finished = True
        return
        
    ImmSrc, RegWrite, ALUSrc, ALUControl, MemWrite, ResultSrc, PCSrc = CONTROL_UNIT(Instr)
    
    PCNext, ALUResult, WriteData, Zero, ImmExt, a3 = DATAPATH(
        session.pc, Instr, ImmSrc, ALUSrc, ALUControl, PCSrc
    )
    
    ReadData = sc_dmem.DATA_MEMORY(ALUResult, WriteData, MemWrite)
    Result = MUX2(ALUResult, ReadData, ResultSrc)
    sc_reg.WRITE_REGISTER_FILE(a3, Result, RegWrite)
    
    session.pc = FLOPR(PCNext, 0, width=32)
    session.steps_executed += 1

def peek_control_signals(session: DebugSession):
    if session.is_finished:
        return {}
        
    # We must ensure state is injected so memory/registers are readable by the combinational logic
    inject_state(session)
    Instr = sc_imem.INSTRUCTION_MEMORY(session.pc)
    
    if Instr == 0:
        return {}
        
    ImmSrc, RegWrite, ALUSrc, ALUControl, MemWrite, ResultSrc, PCSrc = CONTROL_UNIT(Instr)
    PCNext, ALUResult, WriteData, Zero, ImmExt, a3 = DATAPATH(
        session.pc, Instr, ImmSrc, ALUSrc, ALUControl, PCSrc
    )
    ReadData = sc_dmem.DATA_MEMORY(ALUResult, WriteData, MemWrite)
    Result = MUX2(ALUResult, ReadData, ResultSrc)
    
    return {
        "ImmSrc": ImmSrc,
        "RegWrite": RegWrite,
        "ALUSrc": ALUSrc,
        "ALUControl": ALUControl,
        "MemWrite": MemWrite,
        "ResultSrc": ResultSrc,
        "PCSrc": PCSrc,
        "Zero": Zero,
        "Instr": Instr,
        "ImmExt": ImmExt,
        "ALUResult": ALUResult,
        "WriteData": WriteData,
        "ReadData": ReadData,
        "Result": Result,
        "PCNext": PCNext,
        "PCTarget": session.pc + ImmExt
    }

def build_response(session: DebugSession, session_id: str = ""):
    return {
        "status": "success",
        "session_id": session_id,
        "steps_executed": session.steps_executed,
        "hit_limit": False,
        "is_finished": session.is_finished,
        "registers": list(session.registers),
        "memory": list(session.memory[:MEMORY_SNAPSHOT_BYTES]),
        "program_size": session.program_size,
        "pc": session.pc,
        "current_line": session.pc_to_line_map.get(session.pc, None),
        "control_signals": peek_control_signals(session)
    }

# =========================================================
# ENDPOINTS
# =========================================================

@router.post("/run", summary="Ejecutar código")
def run_code(req: RunRequest):
    compilador = CompiladorRISCV()
    try:
        instrucciones_hex, pc_to_line = compilador.compile_program(req.codigo)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    bytes_totales = bytearray()
    for hex_str in instrucciones_hex:
        bytes_totales.extend(bytes.fromhex(hex_str[2:])[::-1])
        
    session = DebugSession(bytes_totales, req.architecture, pc_to_line)
    max_steps = req.max_steps or DEFAULT_MAX_STEPS
    
    try:
        inject_state(session)
        while session.steps_executed < max_steps and not session.is_finished:
            if session.architecture == "single_cycle":
                execute_single_cycle_step(session)
            elif session.architecture == "multi_cycle":
                raise HTTPException(status_code=501, detail="Arquitectura Multi Cycle aún no implementada en hardware.")
            elif session.architecture == "pipeline":
                raise HTTPException(status_code=501, detail="Arquitectura Pipeline aún no implementada en hardware.")
            else:
                raise HTTPException(status_code=400, detail="Arquitectura desconocida.")
        extract_state(session)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Fallo de ejecución en la CPU: {e}")
        
    terminado_por_limite = session.steps_executed == max_steps
    
    response = build_response(session, "")
    response["hit_limit"] = terminado_por_limite
    return response

@router.post("/debug/start", summary="Iniciar Debug (Texto)")
def debug_start(req: RunRequest):
    compilador = CompiladorRISCV()
    try:
        instrucciones_hex, pc_to_line = compilador.compile_program(req.codigo)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    bytes_totales = bytearray()
    for hex_str in instrucciones_hex:
        bytes_totales.extend(bytes.fromhex(hex_str[2:])[::-1])
        
    session_id = str(uuid.uuid4())
    session = DebugSession(bytes_totales, req.architecture, pc_to_line)
    debug_sessions[session_id] = session
    
    return build_response(session, session_id)

@router.post("/upload_bin", summary="Cargar binario (.bin)")
def upload_bin(
    file: UploadFile = File(...),
    architecture: str = Form("single_cycle")
):
    if not file.filename.endswith(".bin"):
        raise HTTPException(status_code=400, detail="El archivo debe tener extensión .bin")
    
    bytes_leidos = file.file.read()
    if len(bytes_leidos) == 0:
        raise HTTPException(status_code=400, detail="El archivo está vacío.")
        
    session_id = str(uuid.uuid4())
    session = DebugSession(bytearray(bytes_leidos), architecture)
    debug_sessions[session_id] = session
    
    return build_response(session, session_id)

@router.post("/debug/step/{session_id}")
def step_debug_session(session_id: str):
    session = debug_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Debug session not found")
        
    if session.is_finished:
        return build_response(session, session_id)
        
    try:
        # Guardar estado actual en el historial antes de ejecutar el paso
        session.history.append({
            "pc": session.pc,
            "steps_executed": session.steps_executed,
            "registers": list(session.registers),
            "memory": bytearray(session.memory),
            "is_finished": session.is_finished,
            "control_signals": dict(session.control_signals)
        })
        
        inject_state(session)
        if session.architecture == "single_cycle":
            execute_single_cycle_step(session)
        extract_state(session)
        
    except Exception as e:
        session.is_finished = True
        raise HTTPException(status_code=400, detail=f"Fallo de hardware crítico: {e}")

    return build_response(session, session_id)

@router.post("/debug/step_back/{session_id}")
def step_back_debug_session(session_id: str):
    session = debug_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Debug session not found")
        
    if not session.history:
        return build_response(session, session_id)
        
    # Restaurar el estado anterior
    last_state = session.history.pop()
    session.pc = last_state["pc"]
    session.steps_executed = last_state["steps_executed"]
    session.registers = last_state["registers"]
    session.memory = last_state["memory"]
    session.is_finished = last_state["is_finished"]
    session.control_signals = last_state.get("control_signals", {})
    
    return build_response(session, session_id)

@router.delete("/debug/{session_id}", summary="Terminar sesión")
def debug_stop(session_id: str):
    if session_id in debug_sessions:
        del debug_sessions[session_id]
    return {"status": "success"}
