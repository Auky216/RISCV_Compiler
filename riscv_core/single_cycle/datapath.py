from mux2 import MUX2
from adder import ADDER
from register_file import REGISTER_FILE
from extend import EXTEND
from alu import ALU

def to_signed_32(val):
    val = val & 0xFFFFFFFF
    return val - (1 << 32) if (val & (1 << 31)) else val

def DATAPATH(PC, Instr, ImmSrc, ALUSrc, ALUControl, ResultSrc, Jump, BranchType):
    # 1. EXTEND
    ImmExt = EXTEND(Instr, ImmSrc)
    
    # 2. Decodificación de Registros
    bits = format(Instr, '032b')
    a1 = int(bits[12:17], 2)
    a2 = int(bits[7:12], 2)
    a3 = int(bits[20:25], 2)
    
    # 3. Register File (Fase Combinacional: Lectura)
    rd1, rd2 = REGISTER_FILE(a1, a2, a3, 0, 0)
    
    # 4. Adders del PC
    PCPlus4 = ADDER(PC, 4)
    PCTarget = ADDER(PC, ImmExt)
    
    # 5. Lógica de la ALU
    SrcA = rd1
    SrcB = MUX2(rd2, ImmExt, ALUSrc)
    
    ALUResult, Zero = ALU(SrcA, SrcB, ALUControl)
    
    # El dato a escribir en memoria si es un Store es rd2
    WriteData = rd2
    
    # Branch Logic (independiente de la ALU para simplificar y soportar todo)
    branch_taken = 0
    if BranchType == 1:   # beq
        branch_taken = 1 if rd1 == rd2 else 0
    elif BranchType == 2: # bne
        branch_taken = 1 if rd1 != rd2 else 0
    elif BranchType == 3: # blt
        branch_taken = 1 if to_signed_32(rd1) < to_signed_32(rd2) else 0
    elif BranchType == 4: # bge
        branch_taken = 1 if to_signed_32(rd1) >= to_signed_32(rd2) else 0
    elif BranchType == 5: # bltu
        branch_taken = 1 if rd1 < rd2 else 0
    elif BranchType == 6: # bgeu
        branch_taken = 1 if rd1 >= rd2 else 0

    # PCSrc Logic
    PCSrc = 0
    if Jump == 1 or branch_taken == 1:
        PCSrc = 1 # Usa PCTarget
    elif Jump == 2:
        PCSrc = 2 # Usa ALUResult (jalr)
        
    if PCSrc == 1:
        PCNext = PCTarget
    elif PCSrc == 2:
        PCNext = ALUResult & ~1 # jalr fuerza el LSB a 0
    else:
        PCNext = PCPlus4

    # En hardware simulado, Result lo calcula 'riscv.py' porque necesita 'ReadData'.
    # Pero para no romper 'datapath.py' que retorna a3 y otros, le pasamos también 
    # PCSrc para que riscv.py sepa cómo generar 'Result'.
    # Espera, 'riscv.py' hace Result = MUX2(ALUResult, ReadData, ResultSrc).
    # Necesitamos que riscv.py use el nuevo MUX5!
    # Entonces vamos a pasar PCPlus4 y PCTarget a riscv.py!
    return PCNext, ALUResult, WriteData, Zero, ImmExt, a3, PCPlus4, PCTarget, PCSrc
