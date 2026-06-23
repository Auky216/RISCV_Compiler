def to_signed_32(val):
    val = val & 0xFFFFFFFF
    return val - (1 << 32) if (val & (1 << 31)) else val

def ALU(a, b, alucontrol):
    result = 0
    a_u = a & 0xFFFFFFFF
    b_u = b & 0xFFFFFFFF
    a_s = to_signed_32(a)
    b_s = to_signed_32(b)
    
    if alucontrol == 0: # ADD
        result = a_u + b_u
    elif alucontrol == 1: # SUB
        result = a_u - b_u
    elif alucontrol == 2: # AND
        result = a_u & b_u
    elif alucontrol == 3: # OR
        result = a_u | b_u
    elif alucontrol == 4: # XOR
        result = a_u ^ b_u
    elif alucontrol == 5: # SLT (signed)
        result = 1 if a_s < b_s else 0
    elif alucontrol == 6: # SLL
        shift_amt = b_u & 0x1F
        result = a_u << shift_amt
    elif alucontrol == 7: # SRL
        shift_amt = b_u & 0x1F
        result = a_u >> shift_amt
    elif alucontrol == 8: # SRA
        shift_amt = b_u & 0x1F
        result = a_s >> shift_amt
    elif alucontrol == 9: # SLTU (unsigned)
        result = 1 if a_u < b_u else 0

    result = result & 0xFFFFFFFF
    zero = 1 if result == 0 else 0
    return result, zero
