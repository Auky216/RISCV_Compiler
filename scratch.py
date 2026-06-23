import sys
sys.path.append("/Users/antonio/Documents/Projects/RISCV_Compiler/api")
from riscv_core.single_cycle.datapath import to_signed_32

rd1 = 0
rd2 = 7
print(to_signed_32(rd1) >= to_signed_32(rd2))
