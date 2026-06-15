from . import utils

def encode_instruction(instruccion_ensamblador: str) -> str:
    # Quitamos paréntesis y comas para facilitar la separación de las partes
    texto_limpio = instruccion_ensamblador.replace(",", " ").replace("(", " ").replace(")", " ")
    partes_instruccion = texto_limpio.split()
    mnemonico = partes_instruccion[0]
    
    # --- EXPANSIÓN DE PSEUDO-INSTRUCCIONES ---
    if mnemonico == "li":
        # li rd, inmediato -> addi rd, zero, inmediato
        rd = partes_instruccion[1]
        inmediato = partes_instruccion[2]
        return encode_instruction(f"addi {rd}, zero, {inmediato}")
        
    elif mnemonico == "mv":
        # mv rd, rs -> addi rd, rs, 0
        rd = partes_instruccion[1]
        rs = partes_instruccion[2]
        return encode_instruction(f"addi {rd}, {rs}, 0")
        
    elif mnemonico == "ret":
        # ret -> jalr zero, ra, 0
        return encode_instruction("jalr zero, ra, 0")
    
    binario_32_bits = ""

    # --- LISTAS DE CLASIFICACIÓN (Para entrar al IF correcto) ---
    instrucciones_tipo_r = ["add", "sub", "sll", "slt", "sltu", "xor", "srl", "sra", "or", "and"]
    instrucciones_tipo_i_alu = ["addi", "slti", "sltiu", "xori", "ori", "andi"]
    instrucciones_tipo_i_shift = ["slli", "srli", "srai"]
    instrucciones_tipo_i_load = ["lb", "lh", "lw", "lbu", "lhu"]
    instrucciones_tipo_s = ["sb", "sh", "sw"]
    instrucciones_tipo_b = ["beq", "bne", "blt", "bge", "bltu", "bgeu"]

    # --- TIPO R (Operaciones entre registros) ---
    if mnemonico in instrucciones_tipo_r:
        registro_destino = utils.registro_a_binario(partes_instruccion[1])
        registro_fuente_1 = utils.registro_a_binario(partes_instruccion[2])
        registro_fuente_2 = utils.registro_a_binario(partes_instruccion[3])
        opcode = "0110011"
        
        funct3 = "000"
        funct7 = "0000000" # Valores por defecto
        
        if mnemonico == "sub":
            funct3 = "000"
            funct7 = "0100000"
        elif mnemonico == "sll":
            funct3 = "001"
        elif mnemonico == "slt":
            funct3 = "010"
        elif mnemonico == "sltu":
            funct3 = "011"
        elif mnemonico == "xor":
            funct3 = "100"
        elif mnemonico == "srl":
            funct3 = "101"
        elif mnemonico == "sra":
            funct3 = "101"
            funct7 = "0100000"
        elif mnemonico == "or":
            funct3 = "110"
        elif mnemonico == "and":
            funct3 = "111"
        
        binario_32_bits = funct7 + registro_fuente_2 + registro_fuente_1 + funct3 + registro_destino + opcode

    # --- TIPO I (Aritmética con Inmediato) ---
    elif mnemonico in instrucciones_tipo_i_alu:
        registro_destino = utils.registro_a_binario(partes_instruccion[1])
        registro_fuente_1 = utils.registro_a_binario(partes_instruccion[2])
        valor_inmediato = int(partes_instruccion[3])
        inmediato_binario = utils.entero_a_binario_con_signo(valor_inmediato, 12)
        opcode = "0010011"
        
        funct3 = "000"
        if mnemonico == "addi":
            funct3 = "000"
        elif mnemonico == "slti":
            funct3 = "010"
        elif mnemonico == "sltiu":
            funct3 = "011"
        elif mnemonico == "xori":
            funct3 = "100"
        elif mnemonico == "ori":
            funct3 = "110"
        elif mnemonico == "andi":
            funct3 = "111"
        
        binario_32_bits = inmediato_binario + registro_fuente_1 + funct3 + registro_destino + opcode

    # --- TIPO I (Corrimientos con cantidad específica 'shamt') ---
    elif mnemonico in instrucciones_tipo_i_shift:
        registro_destino = utils.registro_a_binario(partes_instruccion[1])
        registro_fuente_1 = utils.registro_a_binario(partes_instruccion[2])
        cantidad_corrimiento = int(partes_instruccion[3])
        shamt_binario = utils.entero_a_binario_con_signo(cantidad_corrimiento, 5)
        opcode = "0010011"
        
        funct3 = "000"
        funct7 = "0000000"
        if mnemonico == "slli":
            funct3 = "001"
            funct7 = "0000000"
        elif mnemonico == "srli":
            funct3 = "101"
            funct7 = "0000000"
        elif mnemonico == "srai":
            funct3 = "101"
            funct7 = "0100000"
        
        binario_32_bits = funct7 + shamt_binario + registro_fuente_1 + funct3 + registro_destino + opcode

    # --- TIPO I (Cargas / Loads) ---
    elif mnemonico in instrucciones_tipo_i_load:
        registro_destino = utils.registro_a_binario(partes_instruccion[1])
        valor_inmediato = int(partes_instruccion[2])
        inmediato_binario = utils.entero_a_binario_con_signo(valor_inmediato, 12)
        registro_base = utils.registro_a_binario(partes_instruccion[3])
        opcode = "0000011"
        
        funct3 = "000"
        if mnemonico == "lb":
            funct3 = "000"
        elif mnemonico == "lh":
            funct3 = "001"
        elif mnemonico == "lw":
            funct3 = "010"
        elif mnemonico == "lbu":
            funct3 = "100"
        elif mnemonico == "lhu":
            funct3 = "101"
        
        binario_32_bits = inmediato_binario + registro_base + funct3 + registro_destino + opcode

    # --- TIPO S (Guardados / Stores) ---
    elif mnemonico in instrucciones_tipo_s:
        registro_fuente_2 = utils.registro_a_binario(partes_instruccion[1])
        valor_inmediato = int(partes_instruccion[2])
        inmediato_binario = utils.entero_a_binario_con_signo(valor_inmediato, 12)
        registro_base = utils.registro_a_binario(partes_instruccion[3])
        opcode = "0100011"
        
        funct3 = "000"
        if mnemonico == "sb":
            funct3 = "000"
        elif mnemonico == "sh":
            funct3 = "001"
        elif mnemonico == "sw":
            funct3 = "010"
        
        inmediato_parte_alta = inmediato_binario[0:7]
        inmediato_parte_baja = inmediato_binario[7:12]
        
        binario_32_bits = inmediato_parte_alta + registro_fuente_2 + registro_base + funct3 + inmediato_parte_baja + opcode

    # --- TIPO B (Saltos Condicionales / Branches) ---
    elif mnemonico in instrucciones_tipo_b:
        registro_fuente_1 = utils.registro_a_binario(partes_instruccion[1])
        registro_fuente_2 = utils.registro_a_binario(partes_instruccion[2])
        valor_inmediato = int(partes_instruccion[3])
        # Requiere 13 bits porque el bit 0 siempre se considera 0 y no se almacena igual
        inmediato_binario = utils.entero_a_binario_con_signo(valor_inmediato, 13) 
        opcode = "1100011"
        
        funct3 = "000"
        if mnemonico == "beq":
            funct3 = "000"
        elif mnemonico == "bne":
            funct3 = "001"
        elif mnemonico == "blt":
            funct3 = "100"
        elif mnemonico == "bge":
            funct3 = "101"
        elif mnemonico == "bltu":
            funct3 = "110"
        elif mnemonico == "bgeu":
            funct3 = "111"
        
        # Ordenamiento específico del formato B-Type: 
        # imm[12] | imm[10:5] | rs2 | rs1 | funct3 | imm[4:1] | imm[11]
        bit_12 = inmediato_binario[0]
        bits_10_a_5 = inmediato_binario[2:8]
        bits_4_a_1 = inmediato_binario[8:12]
        bit_11 = inmediato_binario[1]
        
        binario_32_bits = bit_12 + bits_10_a_5 + registro_fuente_2 + registro_fuente_1 + funct3 + bits_4_a_1 + bit_11 + opcode

    # --- TIPO U y J ---
    elif mnemonico in ["lui", "auipc"]:
        registro_destino = utils.registro_a_binario(partes_instruccion[1])
        valor_inmediato = int(partes_instruccion[2])
        inmediato_binario = utils.entero_a_binario_con_signo(valor_inmediato, 20)
        
        opcode = "0110111"
        if mnemonico == "auipc":
            opcode = "0010111"
            
        binario_32_bits = inmediato_binario + registro_destino + opcode

    elif mnemonico == "jal":
        registro_destino = utils.registro_a_binario(partes_instruccion[1])
        valor_inmediato = int(partes_instruccion[2])
        # Requiere 21 bits porque el bit 0 siempre es 0
        inmediato_binario = utils.entero_a_binario_con_signo(valor_inmediato, 21) 
        opcode = "1101111"
        
        # Ordenamiento J-Type: imm[20] | imm[10:1] | imm[11] | imm[19:12]
        bit_20 = inmediato_binario[0]
        bits_10_a_1 = inmediato_binario[10:20]
        bit_11 = inmediato_binario[9]
        bits_19_a_12 = inmediato_binario[1:9]
        
        binario_32_bits = bit_20 + bits_10_a_1 + bit_11 + bits_19_a_12 + registro_destino + opcode

    elif mnemonico == "jalr":
        registro_destino = utils.registro_a_binario(partes_instruccion[1])
        registro_base = utils.registro_a_binario(partes_instruccion[2])
        valor_inmediato = int(partes_instruccion[3])
        inmediato_binario = utils.entero_a_binario_con_signo(valor_inmediato, 12)
        
        opcode = "1100111"
        funct3 = "000"
        
        binario_32_bits = inmediato_binario + registro_base + funct3 + registro_destino + opcode

    else:
        return "Error: Instrucción no encontrada"

    # Convertimos el string binario de 32 bits a un entero, luego a hexadecimal
    numero_entero = int(binario_32_bits, 2)
    hexadecimal_final = hex(numero_entero)[2:].zfill(8).upper()
    return "0x" + hexadecimal_final
