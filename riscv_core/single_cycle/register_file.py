# Memoria del Register File: 32 registros inicializados en 0
rf = [0] * 32

def READ_REGISTER_FILE(a1, a2):
    # Leemos el primer registro
    if a1 == 0:
        rd1 = 0
    else:
        rd1 = rf[a1]
        
    # Leemos el segundo registro
    if a2 == 0:
        rd2 = 0
    else:
        rd2 = rf[a2]
        
    return rd1, rd2

def WRITE_REGISTER_FILE(a3, wd3, we3):
    
        # El registro cero (x0) siempre debe valer 0 y no se puede sobreescribir
        if a3 != 0:
            rf[a3] = wd3

def REGISTER_FILE(a1, a2, a3, wd3, we3):
    # 1. En hardware SIEMPRE se lee en cada ciclo (para alimentar a la ALU)
    rd1, rd2 = READ_REGISTER_FILE(a1, a2)
    
    # 2. La escritura SOLO ocurre si we3 está activado. 
    # Le pasamos we3 a la función y ella decide si escribir o no.
    WRITE_REGISTER_FILE(a3, wd3, we3)
    
    # Retornamos los valores leídos para que el datapath los use
    return rd1, rd2
