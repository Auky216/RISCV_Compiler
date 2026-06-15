def ALU(a, b, alucontrol):
    result = 0
    
    # Ya que es simulado en software, usamos operadores matemáticos directos 
    # en lugar de simular compuertas lógicas complejas bit a bit.
    if alucontrol == 0:
        # ADD
        result = a + b
    elif alucontrol == 1:
        # SUB
        result = a - b
    elif alucontrol == 2:
        # AND
        result = a & b
    elif alucontrol == 3:
        # OR
        result = a | b
    elif alucontrol == 4:
        # XOR
        result = a ^ b
    elif alucontrol == 5:
        # SLT (Set Less Than)
        if a < b:
            result = 1
        else:
            result = 0
            
    elif alucontrol == 6:
        # SLL (Shift Left Logical)
        shift_amt = b & 0x1F
        result = a << shift_amt
    elif alucontrol == 7:
        # SRL (Shift Right Logical)
        shift_amt = b & 0x1F
        # Aseguramos que sea lógico (sin signo) y no aritmético
        unsigned_a = a & 0xFFFFFFFF
        result = unsigned_a >> shift_amt
        
    # Mantenemos el resultado dentro de 32 bits
    result = result & 0xFFFFFFFF
    
    # Bandera Zero: nos dice si el resultado final dio 0
    if result == 0:
        zero = 1
    else:
        zero = 0
        
    return result, zero
