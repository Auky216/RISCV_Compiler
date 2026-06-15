def hex_a_binario_32_bits(texto_hexadecimal: str) -> str:
    """Convierte un string hexadecimal '0x...' a un string binario de 32 bits."""
    entero = int(texto_hexadecimal, 16)
    binario = bin(entero)[2:]
    return binario.zfill(32)

def binario_a_registro(texto_binario: str) -> str:
    """Convierte un binario de 5 bits a su texto de registro equivalente (ej: '00001' -> 'x1')."""
    numero_registro = int(texto_binario, 2)
    return f"x{numero_registro}"

# Mapeo de nombres ABI a índices numéricos
MAPA_ABI = {
    "zero": 0, "ra": 1, "sp": 2, "gp": 3, "tp": 4,
    "t0": 5, "t1": 6, "t2": 7,
    "s0": 8, "fp": 8, "s1": 9,
    "a0": 10, "a1": 11, "a2": 12, "a3": 13, "a4": 14, "a5": 15, "a6": 16, "a7": 17,
    "s2": 18, "s3": 19, "s4": 20, "s5": 21, "s6": 22, "s7": 23, "s8": 24, "s9": 25, "s10": 26, "s11": 27,
    "t3": 28, "t4": 29, "t5": 30, "t6": 31
}

def registro_a_binario(texto_registro: str) -> str:
    """Convierte un texto de registro (ej: 'x1' o 't0') a su binario de 5 bits equivalente."""
    texto_limpio = texto_registro.strip().lower()
    
    # Comprobamos si es un nombre ABI
    if texto_limpio in MAPA_ABI:
        numero_registro = MAPA_ABI[texto_limpio]
    else:
        # Si no es ABI, asumimos que tiene el formato 'xN'
        texto_limpio = texto_limpio.replace("x", "")
        numero_registro = int(texto_limpio)
        
    binario = bin(numero_registro)[2:]
    return binario.zfill(5)

def binario_a_entero_con_signo(texto_binario: str) -> int:
    """Convierte un string binario (complemento a 2) a un número entero con signo."""
    es_negativo = (texto_binario[0] == '1')
    if es_negativo:
        valor_absoluto = int(texto_binario, 2)
        rango_maximo = 1 << len(texto_binario)
        return valor_absoluto - rango_maximo
    else:
        return int(texto_binario, 2)

def entero_a_binario_con_signo(numero: int, cantidad_bits: int) -> str:
    """Convierte un entero a un string binario de una cantidad de bits específica, usando complemento a 2."""
    mascara = (1 << cantidad_bits) - 1
    numero_enmascarado = numero & mascara
    binario = bin(numero_enmascarado)[2:]
    return binario.zfill(cantidad_bits)
