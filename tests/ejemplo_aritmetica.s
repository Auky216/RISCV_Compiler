# Ejemplo 1: Aritmetica Basica
# Carga constantes en x5 y x6, y las suma guardando el resultado en x7.
# Resultado esperado: x7 = 25 (0x19)

addi x5, x0, 10   # x5 = 10
addi x6, x0, 15   # x6 = 15
add  x7, x5, x6   # x7 = 10 + 15 = 25
done: beq x7, x7, done  # Bucle final para evitar seguir ejecutando basura
