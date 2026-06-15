from . import utils
from . import formats

def decode_instruction(texto_hexadecimal: str) -> str:
    binario_32_bits = utils.hex_a_binario_32_bits(texto_hexadecimal)
    opcode = binario_32_bits[25:32]

    # --- TIPO R (Aritmética y lógica entre Registros) ---
    if opcode == "0110011":
        datos = formats.extraer_estructura_tipo_r(binario_32_bits)
        funct3 = datos["funct3"]
        funct7 = datos["funct7"]
        mnemonico = ""
        
        if funct3 == "000" and funct7 == "0000000":
            mnemonico = "add"
        elif funct3 == "000" and funct7 == "0100000":
            mnemonico = "sub"
        elif funct3 == "001" and funct7 == "0000000":
            mnemonico = "sll"
        elif funct3 == "010" and funct7 == "0000000":
            mnemonico = "slt"
        elif funct3 == "011" and funct7 == "0000000":
            mnemonico = "sltu"
        elif funct3 == "100" and funct7 == "0000000":
            mnemonico = "xor"
        elif funct3 == "101" and funct7 == "0000000":
            mnemonico = "srl"
        elif funct3 == "101" and funct7 == "0100000":
            mnemonico = "sra"
        elif funct3 == "110" and funct7 == "0000000":
            mnemonico = "or"
        elif funct3 == "111" and funct7 == "0000000":
            mnemonico = "and"
        else:
            return "Error: Instrucción de Tipo R desconocida"

        registro_destino = utils.binario_a_registro(datos["rd"])
        registro_fuente_1 = utils.binario_a_registro(datos["rs1"])
        registro_fuente_2 = utils.binario_a_registro(datos["rs2"])
        
        return f"{mnemonico} {registro_destino}, {registro_fuente_1}, {registro_fuente_2}"

    # --- TIPO I (Aritmética con Inmediatos y Corrimientos) ---
    elif opcode == "0010011":
        datos = formats.extraer_estructura_tipo_i(binario_32_bits)
        funct3 = datos["funct3"]
        mnemonico = ""
        
        if funct3 == "000":
            mnemonico = "addi"
        elif funct3 == "010":
            mnemonico = "slti"
        elif funct3 == "011":
            mnemonico = "sltiu"
        elif funct3 == "100":
            mnemonico = "xori"
        elif funct3 == "110":
            mnemonico = "ori"
        elif funct3 == "111":
            mnemonico = "andi"
        elif funct3 == "001":
            mnemonico = "slli"
        elif funct3 == "101":
            if datos["inmediato"][0:7] == "0000000":
                mnemonico = "srli"
            else:
                mnemonico = "srai"
        else:
            return "Error: Instrucción de Tipo I (ALU) desconocida"

        if mnemonico in ["slli", "srli", "srai"]:
            # El "Shift Amount" o cantidad de corrimiento, usa solo 5 bits (los de más a la derecha)
            texto_shamt = datos["inmediato"][7:12]
            valor_inmediato = int(texto_shamt, 2)
        else:
            # Para el resto de instrucciones aritméticas, se lee como complemento a 2
            valor_inmediato = utils.binario_a_entero_con_signo(datos["inmediato"])

        registro_destino = utils.binario_a_registro(datos["rd"])
        registro_fuente_1 = utils.binario_a_registro(datos["rs1"])
        
        return f"{mnemonico} {registro_destino}, {registro_fuente_1}, {valor_inmediato}"

    # --- TIPO I (Cargas desde Memoria - Loads) ---
    elif opcode == "0000011":
        datos = formats.extraer_estructura_tipo_i(binario_32_bits)
        funct3 = datos["funct3"]
        mnemonico = ""
        
        if funct3 == "000":
            mnemonico = "lb"
        elif funct3 == "001":
            mnemonico = "lh"
        elif funct3 == "010":
            mnemonico = "lw"
        elif funct3 == "100":
            mnemonico = "lbu"
        elif funct3 == "101":
            mnemonico = "lhu"
        else:
            return "Error: Instrucción de Tipo I (Load) desconocida"

        valor_inmediato = utils.binario_a_entero_con_signo(datos["inmediato"])
        registro_destino = utils.binario_a_registro(datos["rd"])
        registro_base = utils.binario_a_registro(datos["rs1"])
        
        return f"{mnemonico} {registro_destino}, {valor_inmediato}({registro_base})"

    # --- TIPO S (Guardado en Memoria - Stores) ---
    elif opcode == "0100011":
        datos = formats.extraer_estructura_tipo_s(binario_32_bits)
        funct3 = datos["funct3"]
        mnemonico = ""
        
        if funct3 == "000":
            mnemonico = "sb"
        elif funct3 == "001":
            mnemonico = "sh"
        elif funct3 == "010":
            mnemonico = "sw"
        else:
            return "Error: Instrucción de Tipo S desconocida"

        inmediato_completo = datos["inmediato_parte_alta"] + datos["inmediato_parte_baja"]
        valor_inmediato = utils.binario_a_entero_con_signo(inmediato_completo)
        
        registro_fuente_2 = utils.binario_a_registro(datos["rs2"])
        registro_base = utils.binario_a_registro(datos["rs1"])
        
        return f"{mnemonico} {registro_fuente_2}, {valor_inmediato}({registro_base})"

    # --- TIPO B (Saltos Condicionales - Branches) ---
    elif opcode == "1100011":
        datos = formats.extraer_estructura_tipo_b(binario_32_bits)
        funct3 = datos["funct3"]
        mnemonico = ""
        
        if funct3 == "000":
            mnemonico = "beq"
        elif funct3 == "001":
            mnemonico = "bne"
        elif funct3 == "100":
            mnemonico = "blt"
        elif funct3 == "101":
            mnemonico = "bge"
        elif funct3 == "110":
            mnemonico = "bltu"
        elif funct3 == "111":
            mnemonico = "bgeu"
        else:
            return "Error: Instrucción de Tipo B desconocida"

        valor_inmediato = utils.binario_a_entero_con_signo(datos["inmediato_reconstruido"])
        registro_fuente_1 = utils.binario_a_registro(datos["rs1"])
        registro_fuente_2 = utils.binario_a_registro(datos["rs2"])
        
        return f"{mnemonico} {registro_fuente_1}, {registro_fuente_2}, {valor_inmediato}"

    # --- TIPO U y J (Valores Altos y Saltos Incondicionales Largos) ---
    elif opcode == "0110111": # LUI
        datos = formats.extraer_estructura_tipo_u(binario_32_bits)
        valor_inmediato_entero = int(datos["inmediato"], 2)
        registro_destino = utils.binario_a_registro(datos["rd"])
        return f"lui {registro_destino}, {valor_inmediato_entero}"
        
    elif opcode == "0010111": # AUIPC
        datos = formats.extraer_estructura_tipo_u(binario_32_bits)
        valor_inmediato_entero = int(datos["inmediato"], 2)
        registro_destino = utils.binario_a_registro(datos["rd"])
        return f"auipc {registro_destino}, {valor_inmediato_entero}"

    elif opcode == "1101111": # JAL (J-Type)
        datos = formats.extraer_estructura_tipo_j(binario_32_bits)
        valor_inmediato = utils.binario_a_entero_con_signo(datos["inmediato_reconstruido"])
        registro_destino = utils.binario_a_registro(datos["rd"])
        return f"jal {registro_destino}, {valor_inmediato}"

    elif opcode == "1100111": # JALR (I-Type)
        datos = formats.extraer_estructura_tipo_i(binario_32_bits)
        valor_inmediato = utils.binario_a_entero_con_signo(datos["inmediato"])
        registro_destino = utils.binario_a_registro(datos["rd"])
        registro_base = utils.binario_a_registro(datos["rs1"])
        return f"jalr {registro_destino}, {registro_base}, {valor_inmediato}"

    return "Error: Opcode no reconocido por el decodificador"
