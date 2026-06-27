# RISC-V Studio (IDE y Simulador RV32I)

RISC-V Studio es un entorno de desarrollo integrado (IDE) y un simulador ciclo a ciclo del procesador RISC-V de 32 bits (**ISA RV32I**). El simulador está diseñado bajo una estrategia de **traducción funcional directa de hardware (Verilog a Python)**, emulando fielmente el comportamiento físico de los buses, registros y señales lógicas del camino de datos (datapath) monociclo.

---

## 🚀 Características Claves

* **Editor de Código Ensamblador:** Editor interactivo con resaltado sintáctico, numeración de líneas y sincronización en tiempo real.
* **Depuración Ciclo a Ciclo:** Ejecución interactiva que permite avanzar paso a paso (*Step*) o restablecer el procesador (*Reset*).
* **Inspección de Registros Físicos:** Tabla interactiva en tiempo real con los valores de los 32 registros estándar del ISA (`x0` a `x31`), con visualización conmutable en formato decimal y hexadecimal.
* **Visor Hexadecimal de Memoria RAM:** Mapa dinámico del bloque plano de **8 KB** de RAM (Little-Endian) con indicadores visuales flotantes del Program Counter (PC) y Stack Pointer (SP).
* **Esquema de Datapath Interactivo:** Diagrama animado que resalta los componentes activos (ALU, banco de registros, memorias, multiplexores) según la instrucción que se esté ejecutando en el ciclo de reloj actual.
* **Tabla de Verdad Combinacional:** Muestra la decodificación en tiempo real de la Unidad de Control para las señales lógicas (`RegWrite`, `ALUSrc`, `ALUControl`, `MemWrite`, `ResultSrc`, `Jump`, `BranchType`).
* **Soporte para Archivos Binarios:** Opción de cargar binarios `.bin` compilados para simulación directa de código de máquina, incluyendo desensamblado dinámico asistido por *Capstone Engine*.
* **Autenticación e Historial:** Sistema de autenticación integrado con Google Login (OAuth 2.0) y persistencia local de perfiles.

---

## 🛠️ Tecnologías y Arquitectura

El sistema está construido bajo una arquitectura desacoplada Cliente-Servidor de alto rendimiento:

### **Frontend**
* **Next.js 16 (React 19) + TypeScript:** Estructura web modular y robusta.
* **shadcn/ui + Tailwind CSS:** Interfaz estilizada retro-futurista, interactiva y responsiva con animaciones de micro-interacciones.

### **Backend (API)**
* **FastAPI (Python):** Servidor API REST rápido para la gestión del simulador y estados de depuración.
* **Capstone Engine:** Librería para desensamblado e inspección de instrucciones binarias a nivel de bytes.
* **SQLAlchemy + SQLite (Local):** Motor de base de datos local para control de usuarios y perfiles.

---

## 💻 Instalación y Guía de Uso

Asegúrate de tener instalados **Node.js (v18 o superior)** y **Python (v3.9 o superior)**.

### **Paso 1: Configurar y Ejecutar el Backend (FastAPI)**

1. Navega al directorio de la API:
   ```bash
   cd api
   ```
2. Crea e inicia un entorno virtual de Python:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   # En Windows: venv\Scripts\activate
   ```
3. Instala las dependencias necesarias:
   ```bash
   pip install -r requirements.txt
   ```
4. Ejecuta el servidor de desarrollo:
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```
   El backend estará disponible en `http://localhost:8000`.

### **Paso 2: Configurar y Ejecutar el Frontend (Next.js)**

1. Desde el directorio raíz del proyecto:
   ```bash
   npm install
   ```
2. Ejecuta el servidor Next.js en modo desarrollo:
   ```bash
   npm run dev
   ```
3. Abre en tu navegador la dirección:
   **[http://localhost:3000](http://localhost:3000)**

---

## 📂 Estructura del Repositorio

* `/app`: Páginas y componentes del frontend en Next.js (Router de App).
  * `/app/ide`: Vista principal del simulador con el editor de código, registros y consola.
  * `/app/ide/_components`: Componentes modulares (`CodeEditor`, `RegisterPanel`, `MemoryMapPanel`, `DatapathPanel`).
* `/api`: Código fuente del backend de FastAPI.
  * `/api/compiler`: Compilador interno que traduce código ensamblador RISC-V a código hexadecimal de máquina.
  * `/api/routers`: Enrutadores de API para simulación (`riscv.py`) y autenticación de usuarios (`users.py`).
* `/riscv_core`: Simulación del hardware traducido de Verilog ciclo a ciclo.
  * `/riscv_core/single_cycle`: Lógica combinacional y secuencial del procesador monociclo.
* `/tests`: Códigos ensambladores `.s` y binarios `.bin` listos para probar la simulación.
* `/informe_latex`: Reporte técnico formal académico escrito en LaTeX, que incluye evidencias visuales y explicaciones de arquitectura.

---

## 🧪 Pruebas y Validación

El simulador ha sido validado utilizando los siguientes programas de prueba localizados en la carpeta `tests/`:

1. **`riscvtest.s` (Test Base):** Valida la funcionalidad básica de las instrucciones aritméticas, de carga/escritura en memoria y saltos condicionales (`addi`, `or`, `and`, `add`, `beq`, `slt`, `sw`, `lw`, `jal`). Al finalizar correctamente, escribe el valor `25` en la dirección de memoria `100` (`0x64`).
2. **`quicksort.s` (Algoritmo Recursivo):** Comprueba el manejo intensivo de la pila (Stack) ordenando un arreglo en memoria.
3. **`arbol_simetrico.s` (Estructura de Datos):** Prueba la lógica recursiva de navegación de un árbol binario para determinar su simetría.

*Para cargar cualquier programa en el IDE, copia el contenido del código de prueba en el editor y haz clic en **Run**.*

---

## 📈 Trabajo Futuro

* **Base de Datos en la Nube:** Integrar persistencia para almacenar el historial de proyectos y simulaciones de los estudiantes en la nube mediante cuentas asociadas a Google Login.
* **Procesador Multiciclo y Segmentado:** Extender el motor del simulador para soportar emulación Multiciclo (ejecución paso a paso por señales de control internas) y Segmentada (*Pipelined* con mitigación de riesgos).
* **Generación de Reportes PDF:** Implementación de un generador automático de PDFs paso a paso con el trazado del camino de datos y señales lógicas del procesador.
