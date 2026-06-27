# Ejemplo 4: Bucle Contador (Loop)
# Ejecuta un bucle que incrementa x5 hasta llegar a 5.
# Resultado esperado: x5 = 5 (contador final), x7 = 99 (0x63, indicador de fin)

addi x5, x0, 0     # x5 = 0 (contador)
addi x6, x0, 5     # x6 = 5 (limite)
bucle:
addi x5, x5, 1     # x5 = x5 + 1
bne  x5, x6, bucle # Si x5 != 5, vuelve a bucle
addi x7, x0, 99    # Fin del bucle, x7 = 99
done: beq x7, x7, done  # Bucle final
