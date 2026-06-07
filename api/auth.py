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
    Lanza HTTP 401 si no hay cookie o el token es inválido.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado. Por favor inicia sesión.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if access_token is None:
        raise credentials_exception

    user_id = decode_jwt(access_token)
    if user_id is None:
        raise credentials_exception

    user = get_user_by_id(user_id)
    if user is None:
        raise credentials_exception

    return user


def get_optional_user(
    access_token: Optional[str] = Cookie(default=None),
) -> Optional[UserResponse]:
    """
    Igual que `get_current_user` pero devuelve None en lugar de lanzar 401.
    Útil para endpoints donde el login es opcional.
    """
    if access_token is None:
        return None
    user_id = decode_jwt(access_token)
    if user_id is None:
        return None
    return get_user_by_id(user_id)
