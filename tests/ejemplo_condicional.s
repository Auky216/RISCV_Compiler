# Ejemplo 3: Toma de Decisiones (Saltos Condicionales)
# Compara si 5 < 10. Si es verdadero, x8 termina en 100.
# Resultado esperado: x7 = 1, x8 = 100 (0x64), "sino" se salta completamente.

addi x5, x0, 5     # x5 = 5
addi x6, x0, 10    # x6 = 10
slt  x7, x5, x6    # x7 = 1 (porque 5 < 10)
beq  x7, x0, sino  # Si x7 == 0, salta a sino (no se cumple)
addi x8, x0, 100   # Se ejecuta esto (x8 = 100)
jal  x0, fin       # Salta al final
sino:
addi x8, x0, 200   # No se ejecuta (se salta)
fin:
done: beq x8, x8, done  # Bucle final
