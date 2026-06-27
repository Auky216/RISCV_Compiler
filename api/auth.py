"""
auth.py — Utilidades de autenticación JWT.

Firma y verifica JWTs con la SECRET_KEY del entorno.
Incluye la dependency de FastAPI `get_current_user` que extrae
el usuario desde la cookie `access_token`.
"""
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Cookie, Depends, HTTPException, status
from jose import JWTError, jwt

from database import get_user_by_id
from models.user import UserResponse

# Lee desde entorno (definido en .env)
SECRET_KEY: str = os.getenv("SECRET_KEY", "CHANGE_ME_IN_DOT_ENV")
ALGORITHM = "HS256"
TOKEN_EXPIRE_DAYS = 7


# ─── JWT ──────────────────────────────────────────────────────────────────────

def create_jwt(user_id: int) -> str:
    """Firma un JWT con el user_id como `sub` y expiración de 7 días."""
    expire = datetime.now(timezone.utc) + timedelta(days=TOKEN_EXPIRE_DAYS)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_jwt(token: str) -> Optional[int]:
    """
    Valida y decodifica el token.
    Devuelve el user_id (int) o None si el token es inválido/expirado.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        return int(user_id)
    except JWTError:
        return None


# ─── FastAPI Dependency ────────────────────────────────────────────────────────

def get_current_user(
    access_token: Optional[str] = Cookie(default=None),
) -> UserResponse:
    """
    Dependency de FastAPI.
    Lee la cookie `access_token`, valida el JWT y devuelve el usuario.
    Si no hay cookie o la sesion es invalida, genera/retorna el usuario de desarrollo por defecto.
    """
    user = None
    if access_token is not None:
        user_id = decode_jwt(access_token)
        if user_id is not None:
            user = get_user_by_id(user_id)

    # Si no hay sesion valida, retornamos/creamos el usuario mock por defecto
    if user is None:
        from database import create_or_update_user
        from models.user import UserCreate
        user_data = UserCreate(
            google_id="mock_developer_user",
            email="developer@riscv.studio",
            name="Desarrollador RISC-V",
            picture=None,
        )
        user = create_or_update_user(user_data)

    return user


def get_optional_user(
    access_token: Optional[str] = Cookie(default=None),
) -> Optional[UserResponse]:
    """
    Igual que `get_current_user` pero devuelve None en caso de error de token.
    En esta implementacion de bypass, retorna el mismo usuario por defecto.
    """
    return get_current_user(access_token)
