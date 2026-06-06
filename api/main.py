from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from riscv_core.compiler import CompiladorRISCV
from riscv_core.simulator import SimuladorRISCV

app = FastAPI(title="RISC-V Web Backend")

# Modelo de datos que esperamos recibir de React
class PeticionCodigo(BaseModel):
    codigo: str

@app.post("/api/run")
def run_code(peticion: PeticionCodigo):
    lineas_codigo = peticion.codigo.split('\n')
    
    compilador = CompiladorRISCV()
    sim = SimuladorRISCV()
    bytes_totales = bytearray()
    
    # 1. FASE DE COMPILACIÓN
    try:
        instrucciones_hex = compilador.compile_program(peticion.codigo)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    for hex_str in instrucciones_hex:
        bytes_crudos = bytes.fromhex(hex_str[2:])[::-1]
        bytes_totales.extend(bytes_crudos)
        
    if len(bytes_totales) > len(sim.memoria):
        raise HTTPException(status_code=400, detail="El programa ensamblado excede la memoria disponible.")
        
    # Si el código estaba vacío
    if len(bytes_totales) == 0:
        return {"status": "success", "steps_executed": 0, "registers": [0]*32}

    # 2. FASE DE CARGA
    sim.memoria[0:len(bytes_totales)] = bytes_totales
    sim.pc = 0
    
    # 3. FASE DE EJECUCIÓN (Límite de seguridad: 10,000 pasos para evitar bucles infinitos en la web)
    max_steps = 10000
    pasos_ejecutados = 0
    
    try:
        while pasos_ejecutados < max_steps:
            # Leemos los 4 bytes en el PC actual
            b0 = sim.memoria[sim.pc]
            b1 = sim.memoria[sim.pc + 1]
            b2 = sim.memoria[sim.pc + 2]
            b3 = sim.memoria[sim.pc + 3]
            
            # Si los 4 bytes son 0, llegamos al final de la memoria escrita (o a un espacio vacío)
            instruccion = (b3 << 24) | (b2 << 16) | (b1 << 8) | b0
            if instruccion == 0:
                break # Fin del programa
                
            sim.step()
            pasos_ejecutados += 1
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Falla de ejecución en la CPU: {str(e)}")
        
    # Si llegamos al límite, lo informamos, pero seguimos retornando los registros
    terminado_por_limite = pasos_ejecutados == max_steps
        
    # 4. FASE DE EXTRACCIÓN DE RESULTADOS
    registros = []
    for i in range(32):
        registros.append(sim.leer_registro(i))
        
    return {
        "status": "success",
        "steps_executed": pasos_ejecutados,
        "hit_limit": terminado_por_limite,
        "registers": registros
    }
