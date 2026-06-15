def FLOPR(d, reset, width=8):
    if reset:
        return 0
    else:
        limite = 2 ** width
        return d % limite
