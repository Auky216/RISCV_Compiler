# Ejemplo 2: Acceso a Memoria RAM (Lectura y Escritura)
# Escribe el numero 42 en la direccion 1024 (0x400) y luego lo lee en x7.
# Resultado esperado: Memoria[0x400] = 42, x7 = 42 (0x2A)

addi x5, x0, 42    # x5 = 42 (dato a guardar)
addi x6, x0, 1024  # x6 = 1024 (direccion de memoria 0x400)
sw   x5, 0(x6)     # Memoria[1024] = 42
lw   x7, 0(x6)     # x7 = Memoria[1024] = 42
done: beq x7, x7, done  # Bucle final
