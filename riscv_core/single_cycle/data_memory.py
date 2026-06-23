RAM = bytearray(64 * 4) # Usaremos bytearray en vez de list de ints para manejo de bytes directo

def to_signed_8(val):
    return val - 256 if val & 0x80 else val

def to_signed_16(val):
    return val - 65536 if val & 0x8000 else val

def READ_DATA_MEMORY(a, funct3):
    if a >= len(RAM):
        return 0
    if funct3 == 0: # lb
        val = RAM[a]
        return to_signed_8(val) & 0xFFFFFFFF
    elif funct3 == 1: # lh
        val = int.from_bytes(RAM[a:a+2], byteorder='little')
        return to_signed_16(val) & 0xFFFFFFFF
    elif funct3 == 2: # lw
        return int.from_bytes(RAM[a:a+4], byteorder='little')
    elif funct3 == 4: # lbu
        return RAM[a]
    elif funct3 == 5: # lhu
        return int.from_bytes(RAM[a:a+2], byteorder='little')
    return int.from_bytes(RAM[a:a+4], byteorder='little')

def WRITE_DATA_MEMORY(a, wd, we, funct3):
    if we == 1 and a < len(RAM):
        if funct3 == 0: # sb
            RAM[a] = wd & 0xFF
        elif funct3 == 1: # sh
            RAM[a:a+2] = (wd & 0xFFFF).to_bytes(2, byteorder='little')
        elif funct3 == 2: # sw
            RAM[a:a+4] = (wd & 0xFFFFFFFF).to_bytes(4, byteorder='little')

def DATA_MEMORY(a, wd, we, funct3=2):
    # Por defecto funct3=2 (word)
    rd = READ_DATA_MEMORY(a, funct3)
    WRITE_DATA_MEMORY(a, wd, we, funct3)
    return rd
