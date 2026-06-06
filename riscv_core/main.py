import os
import sys
from riscv_core.compiler import CompiladorRISCV
from riscv_core.simulator import SimuladorRISCV

# =========================================================
# Interfaz de Usuario y Gráficos
# =========================================================
def imprimir_bienvenida():
    print("=" * 70)
    print(" 🚀 SIMULADOR INTERACTIVO RISC-V 🚀 ".center(70, "="))
    print("=" * 70)
    print("Comandos disponibles:")
    print("  load <archivo.bin/txt> : Carga un programa (si es .txt lo compila a la RAM)")
    print("  compile <archivo.txt>  : Compila un .txt y lo GUARDA como .bin en tu disco")
    print("  step                   : Ejecuta la siguiente instrucción (1 ciclo)")
    print("  pc                     : Muestra el Program Counter actual")
    print("  regs                   : Muestra el estado de los 32 registros")
    print("  mem <inicio> <fin>     : Muestra un volcado de memoria (en bytes)")
    print("  quit / exit            : Cierra el simulador")
    print("=" * 70)

def imprimir_registros(sim):
    print("\n" + "--- ESTADO DE LOS REGISTROS ---".center(70))
    # Imprimimos en 8 filas de 4 columnas para que se vea ordenado en terminal
    for fila_actual in range(0, 32, 4):
        texto_fila = ""
        for columna_actual in range(4):
            indice = fila_actual + columna_actual
            valor = sim.leer_registro(indice)
            texto_fila += f"x{indice:<2}: 0x{valor:08X} | "
        print(texto_fila)
    print("-" * 70 + "\n")

# =========================================================
# Lógica de Comandos del CLI
# =========================================================
def ejecutar_comando_load(sim, partes_comando: list):
    """Carga un archivo en el simulador. Si es .txt o .s, lo compila en tiempo real."""
    if len(partes_comando) < 2:
        print("Uso: load <ruta_al_archivo>")
        return

    ruta_archivo = partes_comando[1]
    if not os.path.exists(ruta_archivo):
        print(f"Error: No se encontró el archivo '{ruta_archivo}'.")
        return
        
    if ruta_archivo.endswith(".bin"):
        sim.cargar_programa(ruta_archivo)
        sim.pc = 0 # Reiniciamos la CPU
    elif ruta_archivo.endswith(".txt") or ruta_archivo.endswith(".s"):
        print(f"Compilando y cargando archivo de texto '{ruta_archivo}'...")
        try:
            compilador = CompiladorRISCV()
            bytes_totales = bytearray()
            
            with open(ruta_archivo, "r") as archivo:
                for num_linea, linea in enumerate(archivo, 1):
                    # Descartamos comentarios
                    linea = linea.split("#")[0].split("//")[0].strip()
                    if not linea:
                        continue
                    
                    hex_str = compilador.encode_instruction(linea)
                    if hex_str.startswith("Error"):
                        raise ValueError(f"Línea {num_linea}: No se pudo compilar '{linea}'. Detalles: {hex_str}")
                        
                    # Extraemos los bytes y aplicamos Little Endian
                    bytes_crudos = bytes.fromhex(hex_str[2:])[::-1]
                    bytes_totales.extend(bytes_crudos)
                    
            if len(bytes_totales) > len(sim.memoria):
                raise ValueError("El programa ensamblado excede la memoria disponible.")
                
            sim.memoria[0:len(bytes_totales)] = bytes_totales
            print(f"¡Programa compilado y cargado exitosamente! ({len(bytes_totales)} bytes ocupados).")
            sim.pc = 0
            
        except Exception as e:
            print(f"Error de compilación en load: {e}")
    else:
        print("Error: El archivo debe tener extensión .bin, .txt o .s")

def ejecutar_comando_compile(partes_comando: list):
    """Lee un código ensamblador, lo compila y genera un archivo .bin físico en el disco duro."""
    if len(partes_comando) < 2:
        print("Uso: compile <ruta_al_archivo.txt>")
        return

    ruta_txt = partes_comando[1]
    if not os.path.exists(ruta_txt):
        print(f"Error: No se encontró el archivo '{ruta_txt}'.")
        return
        
    nombre_base = os.path.splitext(ruta_txt)[0]
    ruta_bin = nombre_base + ".bin"
    print(f"Compilando '{ruta_txt}' a binario...")
    
    try:
        compilador = CompiladorRISCV()
        bytes_totales = bytearray()
        
        with open(ruta_txt, "r") as archivo:
            for num_linea, linea in enumerate(archivo, 1):
                linea = linea.split("#")[0].split("//")[0].strip()
                if not linea:
                    continue
                
                hex_str = compilador.encode_instruction(linea)
                if hex_str.startswith("Error"):
                    raise ValueError(f"Línea {num_linea}: {hex_str}")
                    
                bytes_crudos = bytes.fromhex(hex_str[2:])[::-1]
                bytes_totales.extend(bytes_crudos)
                
        with open(ruta_bin, "wb") as archivo_binario:
            archivo_binario.write(bytes_totales)
            
        print(f"¡Éxito! Archivo guardado en disco como '{ruta_bin}' ({len(bytes_totales)} bytes).")
    except Exception as e:
        print(f"Error de compilación: {e}")

def ejecutar_comando_memoria(sim, partes_comando: list):
    """Muestra un bloque de memoria (Hex Dump) entre las direcciones indicadas."""
    if len(partes_comando) < 3:
        print("Uso: mem <inicio_decimal_o_hex> <fin_decimal_o_hex>")
        return
        
    try:
        # El 0 en int(x, 0) permite al usuario introducir "0x1A" o "26" y lo interpreta bien.
        inicio = int(partes_comando[1], 0)
        fin = int(partes_comando[2], 0)
        
        if inicio < 0 or fin > len(sim.memoria) or inicio >= fin:
            print("Rango de memoria inválido.")
            return
            
        print(f"\n--- VOLCADO DE MEMORIA [0x{inicio:08X} - 0x{fin:08X}] ---")
        for direccion in range(inicio, fin, 4):
            b0 = sim.memoria[direccion]
            b1 = sim.memoria[direccion+1] if direccion+1 < len(sim.memoria) else 0
            b2 = sim.memoria[direccion+2] if direccion+2 < len(sim.memoria) else 0
            b3 = sim.memoria[direccion+3] if direccion+3 < len(sim.memoria) else 0
            
            # Reensamblamos la palabra de 32 bits solo para imprimirla de forma clara
            palabra_entera = (b3 << 24) | (b2 << 16) | (b1 << 8) | b0
            print(f"0x{direccion:08X}:  {b0:02X} {b1:02X} {b2:02X} {b3:02X}  |  Palabra: 0x{palabra_entera:08X}")
        print("-" * 55 + "\n")
    except ValueError:
        print("Error: Los límites deben ser números válidos.")

# =========================================================
# Bucle Principal de la Consola
# =========================================================
def main():
    simulador = SimuladorRISCV()
    imprimir_bienvenida()

    while True:
        try:
            entrada_usuario = input(f"[PC: 0x{simulador.pc:08X}] riscv> ").strip()
            if not entrada_usuario:
                continue

            partes_comando = entrada_usuario.split()
            comando = partes_comando[0].lower()

            if comando in ["quit", "exit"]:
                print("Saliendo del simulador. ¡Hasta luego!")
                break
                
            elif comando == "load":
                ejecutar_comando_load(simulador, partes_comando)
                
            elif comando == "compile":
                ejecutar_comando_compile(partes_comando)
                
            elif comando == "step":
                try:
                    simulador.step()
                except Exception as e:
                    print(f"Falla de ejecución en la CPU: {e}")
                    
            elif comando == "pc":
                print(f"Program Counter: 0x{simulador.pc:08X}")
                
            elif comando == "regs":
                imprimir_registros(simulador)
                
            elif comando == "mem":
                ejecutar_comando_memoria(simulador, partes_comando)

            else:
                print(f"Comando desconocido: '{comando}'. Usa load, step, compile, regs, pc, mem o quit.")
                
        except KeyboardInterrupt:
            print("\nSaliendo del simulador. ¡Hasta luego!")
            break
        except Exception as e:
            print(f"Error inesperado de consola: {e}")

if __name__ == "__main__":
    main()