import os

# Memoria global (para no leer el archivo en cada ciclo)
RAM = [0] * 64

# Carga inicial simulando el bloque 'initial begin $readmemh...'
ruta_archivo = "riscvtest.txt"
if os.path.exists(ruta_archivo):
    with open(ruta_archivo, "r") as f:
        for i, linea in enumerate(f):
            linea = linea.strip()
            if linea and i < 64:
                # $readmemh lee hexadecimal
                RAM[i] = int(linea, 16)

def INSTRUCTION_MEMORY(a):
    """
    Simula: assign rd = RAM[a[31:2]];
    En Python no pasamos 'rd' como argumento, sino que lo retornamos.
    a[31:2] significa descartar los 2 bits menos significativos (dividir entre 4).
    """
    indice = a >> 2  # a >> 2 es el equivalente exacto a a[31:2]
    
    if indice < len(RAM):
        return RAM[indice]
    else:
        return 0  # Fuera de rango
