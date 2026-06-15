from mux2 import MUX2
from adder import ADDER
from register_file import REGISTER_FILE
from extend import EXTEND
from alu import ALU

def DATAPATH(PC, Instr, ImmSrc, ALUSrc, ALUControl, PCSrc):
    """
    Simula el hardware del Datapath.
    Recibe las señales de la Unidad de Control y los datos de las Memorias.
    Retorna lo necesario para actualizar el estado secuencial al final del ciclo.
    """
    
    # 1. EXTEND
    ImmExt = EXTEND(Instr, ImmSrc)
    
    # 2. Decodificación de Registros
    bits = format(Instr, '032b')
    a1 = int(bits[12:17], 2)  # rs1
    a2 = int(bits[7:12], 2)   # rs2
    a3 = int(bits[20:25], 2)  # rd
    
    # 3. Register File (Fase Combinacional: Lectura)
    # wd3_temp es un valor falso porque la lectura es instantánea y no le importa el wd3 aún
    rd1, rd2 = REGISTER_FILE(a1, a2, a3, 0, 0)
    
    # 4. Adders del PC
    PCPlus4 = ADDER(PC, 4)
    PCTarget = ADDER(PC, ImmExt)
    
    # 5. Lógica de la ALU
    SrcA = rd1
    SrcB = MUX2(rd2, ImmExt, ALUSrc)
    
    ALUResult, Zero = ALU(SrcA, SrcB, ALUControl)
    
    # El dato a escribir en memoria si es un Store es simplemente rd2
    WriteData = rd2
    
    # 6. Lógica del PCNext (Mux principal)
    PCNext = MUX2(PCPlus4, PCTarget, PCSrc)
    
    # En hardware, el Result MUX y la Escritura de Registros ocurren al final,
    # pero como necesitamos ReadData (que viene de afuera), le pasamos 'a3' 
    # al top-level para que termine el trabajo de Writeback.
    return PCNext, ALUResult, WriteData, Zero, ImmExt, a3
