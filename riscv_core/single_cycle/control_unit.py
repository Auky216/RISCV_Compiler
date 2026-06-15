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
        RegWrite = 1
        ALUSrc = 0
        MemWrite = 0
        ResultSrc = 0
        PCSrc = 0
        
        funct3 = bits[17:20]
        funct7_5 = bits[1]
        if funct3 == "000":
            ALUControl = 1 if funct7_5 == "1" else 0
        elif funct3 == "010":
            ALUControl = 5 # slt
        elif funct3 == "110":
            ALUControl = 3 # or
        elif funct3 == "111":
            ALUControl = 2 # and
            
    elif op == "0010011":
        # I-type ALU (addi, etc.)
        ImmSrc = 0
        RegWrite = 1
        ALUSrc = 1
        ALUControl = 0 # add (simplificado)
        MemWrite = 0
        ResultSrc = 0
        PCSrc = 0
        
    elif op == "0000011":
        # lw
        ImmSrc = 0
        RegWrite = 1
        ALUSrc = 1
        ALUControl = 0
        MemWrite = 0
        ResultSrc = 1
        PCSrc = 0
        
    elif op == "0100011":
        # S-type (sw, sb, etc.)
        ImmSrc = 1
        RegWrite = 0
        ALUSrc = 1
        ALUControl = 0
        MemWrite = 1
        ResultSrc = 0
        PCSrc = 0
        
    elif op == "1100011":
        # B-type (beq, bne, etc.)
        ImmSrc = 2
        RegWrite = 0
        ALUSrc = 0
        ALUControl = 1 # sub
        MemWrite = 0
        ResultSrc = 0
        PCSrc = 0 # La lógica de salto completa (Branch AND Zero) faltaría implementarse en el hardware
        
    elif op == "1101111":
        # J-type (jal)
        ImmSrc = 3
        RegWrite = 1
        ALUSrc = 0
        ALUControl = 0
        MemWrite = 0
        ResultSrc = 0
        PCSrc = 1 # Faltaría soporte en ResultSrc para guardar PC+4
        
    return ImmSrc, RegWrite, ALUSrc, ALUControl, MemWrite, ResultSrc, PCSrc
