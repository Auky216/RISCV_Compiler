from datapath import DATAPATH
from control_unit import CONTROL_UNIT
from instruction_memory import INSTRUCTION_MEMORY
from data_memory import DATA_MEMORY
from register_file import WRITE_REGISTER_FILE
from mux2 import MUX2
from flopr import FLOPR

print("Iniciando simulación del procesador Single-Cycle...")

# Estado inicial del procesador
PC = 0
reset = 0

for ciclo in range(5):
    print(f"\n--- CICLO DE RELOJ {ciclo} ---")
    
    # ========================================================
    # 1. FETCH (Leer Instrucción)
    # ========================================================
    Instr = INSTRUCTION_MEMORY(PC)
    
    # ========================================================
    # 2. DECODE (Unidad de Control)
    # ========================================================
    ImmSrc, RegWrite, ALUSrc, ALUControl, MemWrite, ResultSrc, PCSrc = CONTROL_UNIT(Instr)
    
    # Ejecutamos el Datapath para obtener direcciones de memoria y siguientes PCs
    PCNext, ALUResult, WriteData, Zero, ImmExt, a3 = DATAPATH(
        PC, Instr, ImmSrc, ALUSrc, ALUControl, PCSrc
    )
    
    # ========================================================
    # 3. MEMORY (Memoria de Datos)
    # ========================================================
    # Ahora que tenemos ALUResult (dirección), usamos el wrapper DATA_MEMORY
    ReadData = DATA_MEMORY(ALUResult, WriteData, MemWrite)
    
    # ========================================================
    # 4. WRITEBACK Y ACTUALIZACIÓN SECUENCIAL
    # ========================================================
    # El Multiplexor final elige entre el resultado de la ALU y lo que se leyó de la memoria
    Result = MUX2(ALUResult, ReadData, ResultSrc)
    
    # Escribimos el resultado en el registro de destino (si RegWrite = 1)
    WRITE_REGISTER_FILE(a3, Result, RegWrite)
    
    print(f"Instr: 0x{Instr:08X} | ImmSrc: {ImmSrc} | ImmExt: {ImmExt}")
    print(f"ALU Result: {ALUResult} | Zero: {Zero} | ReadData: {ReadData} | Result: {Result}")
    print(f"PC={PC} -> PCNext={PCNext}")

    PC = FLOPR(PCNext, reset, width=32)
