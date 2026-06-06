from riscv_core import decoder
from riscv_core import encoder

class CompiladorRISCV:
    def decode_instruction(self, hexa: str):
        return decoder.decode_instruction(hexa)

    def encode_instruction(self, asm: str):
        return encoder.encode_instruction(asm)
