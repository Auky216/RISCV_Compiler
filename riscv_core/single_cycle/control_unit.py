def CONTROL_UNIT(Instr):
    # 1. Convertimos la instrucción de hexadecimal/entero a binario
    bits = format(Instr, '032b')
    
    # 2. Tomamos los últimos 7 dígitos de la derecha (el Opcode)
    # En Verilog esto es [6:0], en nuestro texto es [25:32]
    op = bits[25:32]
    
    # Señales por defecto
    ImmSrc = 0
    RegWrite = 0
    ALUSrc = 0
    ALUControl = 0
    MemWrite = 0
    ResultSrc = 0
    PCSrc = 0
    
    # 3. Detectamos el tipo de instrucción en base a su Opcode
    if op == "0110011":
        # R-type (add, sub, etc.)
        ImmSrc = 0
        
    elif op == "0010011" or op == "0000011" or op == "1100111":
        # I-type (addi, lw, jalr)
        ImmSrc = 0
        
    elif op == "0100011":
        # S-type (sw, sb, etc.)
        ImmSrc = 1
        
    elif op == "1100011":
        # B-type (beq, bne, etc.)
        ImmSrc = 2
        
    elif op == "1101111":
        # J-type (jal)
        ImmSrc = 3
        
    return ImmSrc, RegWrite, ALUSrc, ALUControl, MemWrite, ResultSrc, PCSrc
