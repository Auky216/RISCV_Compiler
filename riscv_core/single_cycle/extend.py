def EXTEND(Instr, immsrc):
    # Convertimos la instrucción completa a texto binario de 32 bits
    bits = format(Instr, '032b')
    
    # El bit de signo siempre es el bit 31 (índice 0 en texto)
    signo = bits[0]
    
    if immsrc == 0:
        # I-type: {{20{instr[31]}}, instr[31:20]}
        ext = (signo * 20) + bits[0:12]
        
    elif immsrc == 1:
        # S-type: {{20{instr[31]}}, instr[31:25], instr[11:7]}
        ext = (signo * 20) + bits[0:7] + bits[20:25]
        
    elif immsrc == 2:
        # B-type: {{20{instr[31]}}, instr[7], instr[30:25], instr[11:8], 1'b0}
        # instr[7] -> bits[24]
        # instr[30:25] -> bits[1:7]
        # instr[11:8] -> bits[20:24]
        ext = (signo * 20) + bits[24] + bits[1:7] + bits[20:24] + "0"
        
    elif immsrc == 3:
        # J-type: {{12{instr[31]}}, instr[19:12], instr[20], instr[30:21], 1'b0}
        # instr[19:12] -> bits[12:20]
        # instr[20] -> bits[11]
        # instr[30:21] -> bits[1:11]
        ext = (signo * 12) + bits[12:20] + bits[11] + bits[1:11] + "0"
        
    elif immsrc == 4:
        # U-type: {instr[31:12], 12'b0}
        ext = bits[0:20] + "0" * 12
        
    else:
        return 0

    # Convertimos el texto binario final de 32 bits a un número entero
    valor = int(ext, 2)
    
    # Ajuste súper importante para Python: 
    # Si el número es negativo (empieza con 1), Python no lo sabe y cree que es
    # un número positivo gigante (ej. 4 mil millones). Aquí forzamos a que
    # Python entienda que es un número negativo real (-1, -4, etc) usando 
    # complemento a 2, para que tu ADDER pueda sumar restando correctamente.
    if signo == '1':
        valor = valor - (2 ** 32)
        
    return valor
