from . import decoder
from . import encoder

class CompiladorRISCV:
    def decode_instruction(self, hexa: str):
        return decoder.decode_instruction(hexa)

    def encode_instruction(self, asm: str):
        return encoder.encode_instruction(asm)

    def compile_program(self, code: str) -> tuple[list[str], dict[int, int]]:
        """
        Ensamblador de 2 pasadas:
        - Pasada 1: Resuelve etiquetas y calcula el tamaño real del programa.
        - Pasada 2: Codifica las instrucciones, reemplazando etiquetas por offsets relativos.
        Retorna (lista_instrucciones_hex, mapa_pc_a_linea_original).
        """
        import re
        lines = code.split('\n')
        
        symbols = {}
        valid_instructions = []
        current_pc = 0
        
        # Pasada 1: Recolección
        for i, line in enumerate(lines):
            clean_line = line.split("#")[0].split("//")[0].strip()
            
            if not clean_line or clean_line.startswith("."):
                continue
                
            if clean_line.endswith(":"):
                label_name = clean_line[:-1].strip()
                symbols[label_name] = current_pc
                continue
                
            if ":" in clean_line:
                parts = clean_line.split(":", 1)
                label_name = parts[0].strip()
                symbols[label_name] = current_pc
                clean_line = parts[1].strip()
                if not clean_line:
                    continue
            
            valid_instructions.append((i+1, current_pc, clean_line))
            current_pc += 4 
            
        # Pasada 2: Codificación
        hex_instructions = []
        pc_to_line = {}
        for orig_line_num, instr_pc, instr_text in valid_instructions:
            pc_to_line[instr_pc] = orig_line_num
            texto_modificado = instr_text
            for sym_name, sym_pc in symbols.items():
                # Buscamos la etiqueta como palabra exacta para evitar falsos positivos
                pattern = r'\b' + re.escape(sym_name) + r'\b'
                if re.search(pattern, texto_modificado):
                    offset = sym_pc - instr_pc
                    texto_modificado = re.sub(pattern, str(offset), texto_modificado)
                    
            hex_str = self.encode_instruction(texto_modificado)
            if hex_str.startswith("Error"):
                raise Exception(f"Error en la línea {orig_line_num}: {hex_str} -> '{instr_text}'")
                
            hex_instructions.append(hex_str)
            
        return hex_instructions, pc_to_line
