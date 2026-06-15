def extraer_estructura_tipo_r(binario_32_bits: str) -> dict:
    """Extrae los campos de una instrucción de Tipo R."""
    return {
        "funct7": binario_32_bits[0:7],
        "rs2": binario_32_bits[7:12],
        "rs1": binario_32_bits[12:17],
        "funct3": binario_32_bits[17:20],
        "rd": binario_32_bits[20:25],
        "opcode": binario_32_bits[25:32]
    }

def extraer_estructura_tipo_i(binario_32_bits: str) -> dict:
    """Extrae los campos de una instrucción de Tipo I."""
    return {
        "inmediato": binario_32_bits[0:12],
        "rs1": binario_32_bits[12:17],
        "funct3": binario_32_bits[17:20],
        "rd": binario_32_bits[20:25],
        "opcode": binario_32_bits[25:32]
    }

def extraer_estructura_tipo_s(binario_32_bits: str) -> dict:
    """Extrae los campos de una instrucción de Tipo S."""
    return {
        "inmediato_parte_alta": binario_32_bits[0:7],
        "rs2": binario_32_bits[7:12],
        "rs1": binario_32_bits[12:17],
        "funct3": binario_32_bits[17:20],
        "inmediato_parte_baja": binario_32_bits[20:25],
        "opcode": binario_32_bits[25:32]
    }

def extraer_estructura_tipo_b(binario_32_bits: str) -> dict:
    """Extrae los campos de una instrucción de Tipo B."""
    # El inmediato B-Type está desordenado en la especificación de RISC-V
    bit_12 = binario_32_bits[0]
    bits_10_a_5 = binario_32_bits[1:7]
    bits_4_a_1 = binario_32_bits[20:24]
    bit_11 = binario_32_bits[24]
    
    inmediato_reconstruido = bit_12 + bit_11 + bits_10_a_5 + bits_4_a_1 + '0'
    
    return {
        "inmediato_reconstruido": inmediato_reconstruido,
        "rs2": binario_32_bits[7:12],
        "rs1": binario_32_bits[12:17],
        "funct3": binario_32_bits[17:20],
        "opcode": binario_32_bits[25:32]
    }

def extraer_estructura_tipo_u(binario_32_bits: str) -> dict:
    """Extrae los campos de una instrucción de Tipo U."""
    return {
        "inmediato": binario_32_bits[0:20],
        "rd": binario_32_bits[20:25],
        "opcode": binario_32_bits[25:32]
    }

def extraer_estructura_tipo_j(binario_32_bits: str) -> dict:
    """Extrae los campos de una instrucción de Tipo J."""
    # El inmediato J-Type también está desordenado en la especificación
    bit_20 = binario_32_bits[0]
    bits_10_a_1 = binario_32_bits[12:20]
    bit_11 = binario_32_bits[11]
    bits_19_a_12 = binario_32_bits[1:11]
    
    inmediato_reconstruido = bit_20 + bits_19_a_12 + bit_11 + bits_10_a_1 + '0'
    
    return {
        "inmediato_reconstruido": inmediato_reconstruido,
        "rd": binario_32_bits[20:25],
        "opcode": binario_32_bits[25:32]
    }
