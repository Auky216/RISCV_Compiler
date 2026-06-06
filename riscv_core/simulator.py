class SimuladorRISCV:
    def __init__(self, tamano_memoria_mb=1):
        """
        Inicializa el estado arquitectural de la CPU RISC-V.
        """
        # 1. El PC (Program Counter): Inicia en 0
        self.pc = 0
        
        # 2. Los Registros: Lista de 32 enteros inicializados en 0.
        self.registros = [0] * 32
        
        # 3. La Memoria: Un bytearray del tamaño especificado (por defecto 1 MB)
        # 1 MB = 1 * 1024 * 1024 bytes
        tamano_en_bytes = tamano_memoria_mb * 1024 * 1024
        self.memoria = bytearray(tamano_en_bytes)

    # =========================================================
    # Métodos de Acceso a Registros y Memoria
    # =========================================================
    def leer_registro(self, indice_registro: int) -> int:
        """Lee el valor de un registro. El registro x0 siempre devuelve 0."""
        if indice_registro == 0:
            return 0
        return self.registros[indice_registro]

    def escribir_registro(self, indice_registro: int, valor: int):
        """Escribe un valor en un registro. Protege a x0 de ser sobreescrito."""
        if indice_registro != 0:
            valor_32_bits = valor & 0xFFFFFFFF
            self.registros[indice_registro] = valor_32_bits

    def cargar_programa(self, ruta_archivo: str):
        """Carga un archivo binario crudo (.bin) a la memoria."""
        try:
            with open(ruta_archivo, "rb") as archivo_binario:
                bytes_leidos = archivo_binario.read()
                
                if len(bytes_leidos) > len(self.memoria):
                    raise ValueError(f"El programa ({len(bytes_leidos)} bytes) excede la memoria ({len(self.memoria)} bytes).")
                
                self.memoria[0:len(bytes_leidos)] = bytes_leidos
                print(f"Programa cargado exitosamente. {len(bytes_leidos)} bytes copiados a la memoria (dirección 0x00000000).")
                
        except FileNotFoundError:
            print(f"Error: No se pudo encontrar el archivo '{ruta_archivo}'.")
        except Exception as e:
            print(f"Ocurrió un error al cargar el programa: {e}")

    # =========================================================
    # Ciclo Principal: Fetch-Decode-Execute
    # =========================================================
    def step(self):
        """
        Ejecuta un ciclo completo de la CPU leyendo de la memoria y procesando.
        """
        # 1. FETCH (Buscar)
        instruccion_entera = self._buscar_instruccion_en_memoria()
        texto_hexadecimal = self._convertir_entero_a_hexadecimal(instruccion_entera)
        
        # 2. DECODE (Decodificar)
        mnemonico, partes = self._decodificar_instruccion(texto_hexadecimal)
        
        # Por defecto, el PC avanzará 4 bytes a menos que un salto lo cambie
        self.siguiente_pc = self.pc + 4
        
        # 3. EXECUTE (Ejecutar)
        self._ejecutar_instruccion_por_categoria(mnemonico, partes)
        
        # 4. Actualizamos el Program Counter
        self.pc = self.siguiente_pc

    # =========================================================
    # Funciones Auxiliares del Ciclo de Procesamiento
    # =========================================================
    def _buscar_instruccion_en_memoria(self) -> int:
        """Lee 4 bytes de memoria desde el PC actual usando Little-Endian."""
        b0 = self.memoria[self.pc]
        b1 = self.memoria[self.pc + 1]
        b2 = self.memoria[self.pc + 2]
        b3 = self.memoria[self.pc + 3]
        return (b3 << 24) | (b2 << 16) | (b1 << 8) | b0

    def _convertir_entero_a_hexadecimal(self, instruccion_entera: int) -> str:
        """Convierte la instrucción cruda (ej. 1048595) a texto hex (ej. '0x00100013')."""
        return "0x" + hex(instruccion_entera)[2:].zfill(8).upper()

    def _decodificar_instruccion(self, texto_hexadecimal: str):
        """Delega la interpretación de bytes a nuestro compilador previamente creado."""
        from riscv_core.compiler import CompiladorRISCV
        compilador = CompiladorRISCV()
        instruccion_asm = compilador.decode_instruction(texto_hexadecimal)
        
        if instruccion_asm.startswith("Error:"):
            raise ValueError(f"Instrucción desconocida en PC 0x{self.pc:08X}: {texto_hexadecimal}")
            
        texto_limpio = instruccion_asm.replace(",", " ").replace("(", " ").replace(")", " ")
        partes = texto_limpio.split()
        mnemonico = partes[0]
        return mnemonico, partes

    def _ejecutar_instruccion_por_categoria(self, mnemonico: str, partes: list):
        """Enruta la instrucción a su bloque de ejecución lógico correspondiente."""
        if mnemonico in ["add", "sub", "sll", "slt", "sltu", "xor", "srl", "sra", "or", "and"]:
            self._ejecutar_tipo_r_operaciones_entre_registros(mnemonico, partes)
            
        elif mnemonico in ["addi", "slti", "sltiu", "xori", "ori", "andi", "slli", "srli", "srai"]:
            self._ejecutar_tipo_i_operaciones_inmediatas(mnemonico, partes)
            
        elif mnemonico in ["lb", "lh", "lw", "lbu", "lhu"]:
            self._ejecutar_tipo_i_carga_desde_memoria(mnemonico, partes)
            
        elif mnemonico in ["sb", "sh", "sw"]:
            self._ejecutar_tipo_s_almacenamiento_en_memoria(mnemonico, partes)
            
        elif mnemonico in ["beq", "bne", "blt", "bge", "bltu", "bgeu"]:
            self._ejecutar_tipo_b_saltos_condicionales(mnemonico, partes)
            
        elif mnemonico in ["lui", "auipc", "jal", "jalr"]:
            self._ejecutar_saltos_y_cargas_altas(mnemonico, partes)
            
        else:
            print(f"Advertencia: Instrucción '{mnemonico}' no soportada por el simulador aún.")

    # =========================================================
    # Matemáticas de Procesador y Signos
    # =========================================================
    def _obtener_indice(self, texto_registro: str) -> int:
        """Convierte el texto 'x15' al entero 15."""
        return int(texto_registro.replace("x", ""))

    def _entero_con_signo(self, valor_32_bits: int) -> int:
        """
        Para emular un registro de 32 bits, si el valor cruza el umbral positivo
        (0x7FFFFFFF), se le resta 0x100000000 para forzar el comportamiento nativo
        de complemento a dos en números negativos de Python.
        """
        limite_positivo = 0x7FFFFFFF
        compensacion_32bits = 0x100000000
        if valor_32_bits > limite_positivo:
            return valor_32_bits - compensacion_32bits
        return valor_32_bits

    # =========================================================
    # Lógica de Ejecución por Tipo (Instrucciones)
    # =========================================================
    def _ejecutar_tipo_r_operaciones_entre_registros(self, mnemonico: str, partes: list):
        registro_destino = self._obtener_indice(partes[1])
        valor_rs1 = self.leer_registro(self._obtener_indice(partes[2]))
        valor_rs2 = self.leer_registro(self._obtener_indice(partes[3]))
        resultado = 0
        
        if mnemonico == "add":
            resultado = valor_rs1 + valor_rs2
        elif mnemonico == "sub":
            resultado = valor_rs1 - valor_rs2
        elif mnemonico == "sll":
            resultado = valor_rs1 << (valor_rs2 & 0x1F)
        elif mnemonico == "slt":
            # Set Less Than: Compara asumiendo que tienen signo
            v1_signo = self._entero_con_signo(valor_rs1)
            v2_signo = self._entero_con_signo(valor_rs2)
            resultado = 1 if v1_signo < v2_signo else 0
        elif mnemonico == "sltu":
            # Set Less Than Unsigned: Compara ignorando el signo
            resultado = 1 if valor_rs1 < valor_rs2 else 0
        elif mnemonico == "xor":
            resultado = valor_rs1 ^ valor_rs2
        elif mnemonico == "srl":
            resultado = valor_rs1 >> (valor_rs2 & 0x1F)
        elif mnemonico == "sra":
            v1_signo = self._entero_con_signo(valor_rs1)
            resultado = v1_signo >> (valor_rs2 & 0x1F)
        elif mnemonico == "or":
            resultado = valor_rs1 | valor_rs2
        elif mnemonico == "and":
            resultado = valor_rs1 & valor_rs2
            
        self.escribir_registro(registro_destino, resultado)

    def _ejecutar_tipo_i_operaciones_inmediatas(self, mnemonico: str, partes: list):
        registro_destino = self._obtener_indice(partes[1])
        valor_rs1 = self.leer_registro(self._obtener_indice(partes[2]))
        inmediato = int(partes[3])
        resultado = 0
        
        if mnemonico == "addi":
            resultado = valor_rs1 + inmediato
        elif mnemonico == "slti":
            v1_signo = self._entero_con_signo(valor_rs1)
            resultado = 1 if v1_signo < inmediato else 0
        elif mnemonico == "sltiu":
            resultado = 1 if valor_rs1 < (inmediato & 0xFFFFFFFF) else 0
        elif mnemonico == "xori":
            resultado = valor_rs1 ^ inmediato
        elif mnemonico == "ori":
            resultado = valor_rs1 | inmediato
        elif mnemonico == "andi":
            resultado = valor_rs1 & inmediato
        elif mnemonico == "slli":
            resultado = valor_rs1 << (inmediato & 0x1F)
        elif mnemonico == "srli":
            resultado = valor_rs1 >> (inmediato & 0x1F)
        elif mnemonico == "srai":
            v1_signo = self._entero_con_signo(valor_rs1)
            resultado = v1_signo >> (inmediato & 0x1F)
            
        self.escribir_registro(registro_destino, resultado)

    def _ejecutar_tipo_i_carga_desde_memoria(self, mnemonico: str, partes: list):
        registro_destino = self._obtener_indice(partes[1])
        inmediato_desplazamiento = int(partes[2])
        valor_base = self.leer_registro(self._obtener_indice(partes[3]))
        
        direccion_efectiva = valor_base + inmediato_desplazamiento
        resultado = 0
        
        if mnemonico == "lb":
            valor = self.memoria[direccion_efectiva]
            resultado = valor - 0x100 if valor > 0x7F else valor
        elif mnemonico == "lbu":
            resultado = self.memoria[direccion_efectiva]
        elif mnemonico == "lh":
            valor = self.memoria[direccion_efectiva] | (self.memoria[direccion_efectiva+1] << 8)
            resultado = valor - 0x10000 if valor > 0x7FFF else valor
        elif mnemonico == "lhu":
            resultado = self.memoria[direccion_efectiva] | (self.memoria[direccion_efectiva+1] << 8)
        elif mnemonico == "lw":
            b0 = self.memoria[direccion_efectiva]
            b1 = self.memoria[direccion_efectiva+1]
            b2 = self.memoria[direccion_efectiva+2]
            b3 = self.memoria[direccion_efectiva+3]
            resultado = b0 | (b1 << 8) | (b2 << 16) | (b3 << 24)
            
        self.escribir_registro(registro_destino, resultado)

    def _ejecutar_tipo_s_almacenamiento_en_memoria(self, mnemonico: str, partes: list):
        valor_a_guardar = self.leer_registro(self._obtener_indice(partes[1]))
        inmediato_desplazamiento = int(partes[2])
        valor_base = self.leer_registro(self._obtener_indice(partes[3]))
        
        direccion_efectiva = valor_base + inmediato_desplazamiento
        
        if mnemonico == "sb":
            self.memoria[direccion_efectiva] = valor_a_guardar & 0xFF
        elif mnemonico == "sh":
            self.memoria[direccion_efectiva] = valor_a_guardar & 0xFF
            self.memoria[direccion_efectiva+1] = (valor_a_guardar >> 8) & 0xFF
        elif mnemonico == "sw":
            self.memoria[direccion_efectiva] = valor_a_guardar & 0xFF
            self.memoria[direccion_efectiva+1] = (valor_a_guardar >> 8) & 0xFF
            self.memoria[direccion_efectiva+2] = (valor_a_guardar >> 16) & 0xFF
            self.memoria[direccion_efectiva+3] = (valor_a_guardar >> 24) & 0xFF

    def _ejecutar_tipo_b_saltos_condicionales(self, mnemonico: str, partes: list):
        valor_rs1 = self.leer_registro(self._obtener_indice(partes[1]))
        valor_rs2 = self.leer_registro(self._obtener_indice(partes[2]))
        distancia_salto = int(partes[3])
        
        v1_signo = self._entero_con_signo(valor_rs1)
        v2_signo = self._entero_con_signo(valor_rs2)
        
        salto_tomado = False
        if mnemonico == "beq" and valor_rs1 == valor_rs2: salto_tomado = True
        elif mnemonico == "bne" and valor_rs1 != valor_rs2: salto_tomado = True
        elif mnemonico == "blt" and v1_signo < v2_signo: salto_tomado = True
        elif mnemonico == "bge" and v1_signo >= v2_signo: salto_tomado = True
        elif mnemonico == "bltu" and valor_rs1 < valor_rs2: salto_tomado = True
        elif mnemonico == "bgeu" and valor_rs1 >= valor_rs2: salto_tomado = True
            
        if salto_tomado:
            # En lugar de sumarle 4 al PC, saltamos al destino calculado
            self.siguiente_pc = self.pc + distancia_salto

    def _ejecutar_saltos_y_cargas_altas(self, mnemonico: str, partes: list):
        registro_destino = self._obtener_indice(partes[1])
        
        if mnemonico == "lui":
            inmediato = int(partes[2])
            self.escribir_registro(registro_destino, inmediato << 12)
            
        elif mnemonico == "auipc":
            inmediato = int(partes[2])
            self.escribir_registro(registro_destino, self.pc + (inmediato << 12))
            
        elif mnemonico == "jal":
            distancia_salto = int(partes[2])
            self.escribir_registro(registro_destino, self.pc + 4)
            self.siguiente_pc = self.pc + distancia_salto
            
        elif mnemonico == "jalr":
            valor_base = self.leer_registro(self._obtener_indice(partes[2]))
            inmediato_offset = int(partes[3])
            
            self.escribir_registro(registro_destino, self.pc + 4)
            # El salto fuerza a que el bit menos significativo sea cero (alineación en RISC-V)
            self.siguiente_pc = (valor_base + inmediato_offset) & ~1
