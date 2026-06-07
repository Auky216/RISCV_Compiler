"""
main.py — Punto de entrada de la API FastAPI del RISC-V Studio.

Registra los routers modulares:
  • /api/run          → routers/riscv.py   (compilador + simulador)
  • /api/auth/*       → routers/users.py   (Google OAuth2)
  • /api/users/*      → routers/users.py   (perfil y listado)

Inicializa la base de datos SQLite de usuarios al arrancar.
"""
import os
import sys
from pathlib import Path

# Agrega el directorio raíz del proyecto al path para que `riscv_core`
# (que vive en RISCV_Compiler/, no en RISCV_Compiler/api/) sea importable.
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Carga .env desde el mismo directorio donde vive este archivo (api/)
load_dotenv(Path(__file__).resolve().parent / ".env")

from database import init_db
from routers import riscv, users

# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="RISC-V Studio API",
    description=(
        "Backend del RISC-V Studio IDE. "
        "Expone endpoints para compilar/simular ensamblador RISC-V "
        "y para la autenticación de usuarios con Google OAuth2."
    ),
    version="2.0.0",
)

# ── CORS ───────────────────────────────────────────────────────────────────────
# Permite peticiones del servidor de desarrollo de Next.js
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,          # Necesario para enviar/recibir cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Inicialización de la BD ────────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    init_db()

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(riscv.router, prefix="/api")
app.include_router(users.router, prefix="/api")

# ── Health check ───────────────────────────────────────────────────────────────
@app.get("/api/health", tags=["Meta"])
def health():
    """Verifica que la API está corriendo."""
    return {"status": "ok", "version": app.version}
