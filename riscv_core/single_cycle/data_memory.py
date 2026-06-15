# Memoria de Datos: Arreglo de 64 posiciones inicializadas en 0
RAM = [0] * 64

def READ_DATA_MEMORY(a):
    # En Verilog tienes: assign rd = RAM[a[31:2]];
    # Desplazar 2 bits a la derecha (a >> 2) es lo mismo que dividir entre 4 (word-aligned).
    # Usamos módulo 64 (% 64) para evitar que Python falle si la dirección sale del arreglo.
    index = (a >> 2) % 64
    
    rd = RAM[index]
    return rd

def WRITE_DATA_MEMORY(a, wd, we):
    # En Verilog: always @(posedge clk) begin if (we) RAM[a[31:2]] <= wd; end
    if we == 1:
        index = (a >> 2) % 64
        RAM[index] = wd

def DATA_MEMORY(a, wd, we):
    # 1. SIEMPRE leemos de la memoria (Fase Combinacional)
    rd = READ_DATA_MEMORY(a)
    
    # 2. Escribimos en la memoria (Fase Secuencial)
    # La función WRITE internamente decidirá si escribe o no basado en "we"
    WRITE_DATA_MEMORY(a, wd, we)
    
    # 3. ¡Súper importante! Retornar lo que leímos para que datapath.py lo pueda usar
    return rd
