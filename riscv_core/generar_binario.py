# Este es un pequeño programa de prueba que podemos codificar para tener un binario.
# Queremos que haga lo siguiente:
# addi x1, x0, 5    (x1 = 5)
# addi x2, x0, 10   (x2 = 10)
# add  x3, x1, x2   (x3 = 15)

from riscv_core.compiler import CompiladorRISCV

def generar_binario_prueba():
    compilador = CompiladorRISCV()
    
    # 1. Obtenemos las instrucciones en hexadecimal
    hex1 = compilador.encode_instruction("addi x1, x0, 5")
    hex2 = compilador.encode_instruction("addi x2, x0, 10")
    hex3 = compilador.encode_instruction("add x3, x1, x2")
    
    print(f"Instrucción 1 (addi x1, x0, 5):  {hex1}")
    print(f"Instrucción 2 (addi x2, x0, 10): {hex2}")
    print(f"Instrucción 3 (add x3, x1, x2):  {hex3}")
    
    # 2. Las convertimos a bytes
    # Quitan el "0x" y usamos fromhex
    bytes_inst_1 = bytes.fromhex(hex1[2:])
    bytes_inst_2 = bytes.fromhex(hex2[2:])
    bytes_inst_3 = bytes.fromhex(hex3[2:])
    
    # IMPORTANTE: Recordar que RISC-V y nuestro simulador usan Little Endian,
    # por lo que debemos invertir el orden de los bytes de cada instrucción
    # antes de guardarlos en el archivo.
    bytes_inst_1_little_endian = bytes_inst_1[::-1]
    bytes_inst_2_little_endian = bytes_inst_2[::-1]
    bytes_inst_3_little_endian = bytes_inst_3[::-1]
    
    # 3. Guardamos todo en un archivo crudo
    nombre_archivo = "programa_prueba.bin"
    with open(nombre_archivo, "wb") as f:
        f.write(bytes_inst_1_little_endian)
        f.write(bytes_inst_2_little_endian)
        f.write(bytes_inst_3_little_endian)
        
    print(f"\n¡Archivo '{nombre_archivo}' generado con éxito!")
    print(f"Tamaño: {3 * 4} bytes.")
    print("\nPara probarlo en tu simulador, usa el comando:")
    print(f"riscv> load {nombre_archivo}")

if __name__ == "__main__":
    generar_binario_prueba()
