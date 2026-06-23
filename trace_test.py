import sys
sys.path.append("/Users/antonio/Documents/Projects/RISCV_Compiler/api")
from compiler.compiler import CompiladorRISCV
from routers.riscv import DebugSession, inject_state, execute_single_cycle_step, extract_state

c = CompiladorRISCV()
with open('/Users/antonio/Documents/Projects/RISCV_Compiler/tests/quicksort.s') as f:
    code = f.read()

hexs, pc_to_line = c.compile_program(code)
bytes_totales = bytearray()
for hex_str in hexs:
    bytes_totales.extend(bytes.fromhex(hex_str[2:])[::-1])

session = DebugSession(bytes_totales, "single_cycle", pc_to_line)
inject_state(session)
for i in range(25):
    execute_single_cycle_step(session)
    extract_state(session)
    a1 = session.registers[11]
    a2 = session.registers[12]
    print(f"Step {i+1}: PC={session.pc} line={session.pc_to_line_map.get(session.pc)} a1={a1} a2={a2}")
