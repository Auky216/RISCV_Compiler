def CONTROL_UNIT(Instr):
    bits = format(Instr, '032b')
    op = bits[25:32]
    funct3 = bits[17:20]
    funct7_5 = bits[1]
    
    ImmSrc = 0
    RegWrite = 0
    ALUSrc = 0
    ALUControl = 0
    MemWrite = 0
    ResultSrc = 0
    Jump = 0
    BranchType = 0
    
    if op == "0110011": # R-type
        ImmSrc = 0
        RegWrite = 1
        ALUSrc = 0
        MemWrite = 0
        ResultSrc = 0
        Jump = 0
        BranchType = 0
        
        if funct3 == "000": ALUControl = 1 if funct7_5 == "1" else 0 # sub/add
        elif funct3 == "001": ALUControl = 6 # sll
        elif funct3 == "010": ALUControl = 5 # slt
        elif funct3 == "011": ALUControl = 9 # sltu
        elif funct3 == "100": ALUControl = 4 # xor
        elif funct3 == "101": ALUControl = 8 if funct7_5 == "1" else 7 # sra/srl
        elif funct3 == "110": ALUControl = 3 # or
        elif funct3 == "111": ALUControl = 2 # and

    elif op == "0010011": # I-type ALU
        ImmSrc = 0
        RegWrite = 1
        ALUSrc = 1
        MemWrite = 0
        ResultSrc = 0
        Jump = 0
        BranchType = 0
        
        if funct3 == "000": ALUControl = 0 # addi
        elif funct3 == "001": ALUControl = 6 # slli
        elif funct3 == "010": ALUControl = 5 # slti
        elif funct3 == "011": ALUControl = 9 # sltiu
        elif funct3 == "100": ALUControl = 4 # xori
        elif funct3 == "101": ALUControl = 8 if funct7_5 == "1" else 7 # srai/srli
        elif funct3 == "110": ALUControl = 3 # ori
        elif funct3 == "111": ALUControl = 2 # andi

    elif op == "0000011": # lw, lh, lb, lhu, lbu
        ImmSrc = 0
        RegWrite = 1
        ALUSrc = 1
        ALUControl = 0 # add
        MemWrite = 0
        ResultSrc = 1
        Jump = 0
        BranchType = 0
        
    elif op == "0100011": # S-type
        ImmSrc = 1
        RegWrite = 0
        ALUSrc = 1
        ALUControl = 0 # add
        MemWrite = 1
        ResultSrc = 0
        Jump = 0
        BranchType = 0
        
    elif op == "1100011": # B-type
        ImmSrc = 2
        RegWrite = 0
        ALUSrc = 0
        ALUControl = 1 # sub (no strict need since branch is external)
        MemWrite = 0
        ResultSrc = 0
        Jump = 0
        
        if funct3 == "000": BranchType = 1 # beq
        elif funct3 == "001": BranchType = 2 # bne
        elif funct3 == "100": BranchType = 3 # blt
        elif funct3 == "101": BranchType = 4 # bge
        elif funct3 == "110": BranchType = 5 # bltu
        elif funct3 == "111": BranchType = 6 # bgeu
        
    elif op == "1101111": # jal
        ImmSrc = 3
        RegWrite = 1
        ALUSrc = 0
        ALUControl = 0
        MemWrite = 0
        ResultSrc = 2 # PCPlus4
        Jump = 1
        BranchType = 0

    elif op == "1100111": # jalr
        ImmSrc = 0
        RegWrite = 1
        ALUSrc = 1
        ALUControl = 0 # add
        MemWrite = 0
        ResultSrc = 2 # PCPlus4
        Jump = 2
        BranchType = 0

    elif op == "0110111": # lui
        ImmSrc = 4 # U-type
        RegWrite = 1
        ALUSrc = 1
        ALUControl = 0
        MemWrite = 0
        ResultSrc = 3 # ImmExt
        Jump = 0
        BranchType = 0

    elif op == "0010111": # auipc
        ImmSrc = 4 # U-type
        RegWrite = 1
        ALUSrc = 1
        ALUControl = 0
        MemWrite = 0
        ResultSrc = 4 # PCTarget
        Jump = 0
        BranchType = 0
        
    return ImmSrc, RegWrite, ALUSrc, ALUControl, MemWrite, ResultSrc, Jump, BranchType
