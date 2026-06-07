"""
routers/users.py — Endpoints de autenticación y gestión de usuarios.

Rutas:
  GET  /api/auth/google          → Redirige al consent screen de Google
  GET  /api/auth/callback        → Recibe el code, obtiene perfil, emite JWT
  GET  /api/auth/logout          → Borra la cookie de sesión
  GET  /api/users/me             → Perfil del usuario autenticado
  GET  /api/users/               → Lista todos los usuarios (protegido)
"""
import os
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import RedirectResponse

from auth import create_jwt, get_current_user, get_optional_user
from database import create_or_update_user, list_users
from models.user import UserCreate, UserResponse

router = APIRouter(
    prefix="",
    tags=["Users & Auth"],
)

# ── Variables de entorno ───────────────────────────────────────────────────────
GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
REDIRECT_URI         = os.getenv("REDIRECT_URI", "http://localhost:8000/api/auth/callback")
FRONTEND_URL         = os.getenv("FRONTEND_URL", "http://localhost:3000")

GOOGLE_AUTH_URL  = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


# ── Auth endpoints ─────────────────────────────────────────────────────────────

@router.get("/auth/google", summary="Inicia el flujo OAuth con Google")
def login_google():
    """
    Redirige al usuario al consent screen de Google OAuth2.
    Solicita los scopes de perfil y email.
    """
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail="GOOGLE_CLIENT_ID no configurado. Revisa el archivo .env de la API.",
        )

    params = {
        "client_id":     GOOGLE_CLIENT_ID,
        "redirect_uri":  REDIRECT_URI,
        "response_type": "code",
        "scope":         "openid email profile",
        "access_type":   "offline",
        "prompt":        "select_account",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(url=f"{GOOGLE_AUTH_URL}?{query}")


@router.get("/auth/callback", summary="Callback de Google OAuth2")
async def google_callback(code: Optional[str] = None, error: Optional[str] = None):
    """
    Google redirige aquí con un `code` (o `error` si el usuario canceló).
    Se intercambia el code por un access_token, se obtiene el perfil del
    usuario, se guarda/actualiza en la BD y se emite una cookie JWT.
    """
    if error or not code:
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=acceso_denegado")

    # 1. Intercambiar code → access_token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(GOOGLE_TOKEN_URL, data={
            "client_id":     GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "code":          code,
            "grant_type":    "authorization_code",
            "redirect_uri":  REDIRECT_URI,
        })

    if token_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Error al obtener el token de Google.")

    token_data = token_response.json()
    access_token_google = token_data.get("access_token")

    # 2. Obtener perfil del usuario desde Google
    async with httpx.AsyncClient() as client:
        userinfo_response = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token_google}"},
        )

    if userinfo_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Error al obtener el perfil de Google.")

    profile = userinfo_response.json()

    # 3. Guardar / actualizar en la BD
    user_data = UserCreate(
        google_id=profile["sub"],
        email=profile["email"],
        name=profile.get("name", profile["email"]),
        picture=profile.get("picture"),
    )
    user = create_or_update_user(user_data)

    # 4. Emitir JWT propio en cookie HTTP-only
    jwt_token = create_jwt(user.id)
    response = RedirectResponse(url=f"{FRONTEND_URL}/", status_code=302)
    response.set_cookie(
        key="access_token",
        value=jwt_token,
        httponly=True,          # No accesible desde JS
        secure=False,           # Cambiar a True en producción (HTTPS)
        samesite="lax",
        max_age=7 * 24 * 3600,  # 7 días
        path="/",
    )
    return response


@router.get("/auth/logout", summary="Cierra la sesión del usuario")
def logout():
    """Elimina la cookie de sesión y redirige al login."""
    response = RedirectResponse(url=f"{FRONTEND_URL}/login", status_code=302)
    response.delete_cookie(key="access_token", path="/")
    return response


# ── User endpoints ─────────────────────────────────────────────────────────────

@router.get(
    "/users/me",
    response_model=UserResponse,
    summary="Devuelve el perfil del usuario autenticado",
)
def get_me(current_user: UserResponse = Depends(get_current_user)):
    """
    Requiere la cookie `access_token` válida.
    Devuelve los datos del usuario en sesión.
    """
    return current_user


@router.get(
    "/users/",
    response_model=list[UserResponse],
    summary="Lista todos los usuarios registrados",
)
def get_users(current_user: UserResponse = Depends(get_current_user)):
    """
    Endpoint protegido — requiere estar autenticado.
    Devuelve la lista completa de usuarios de la BD.
    """
    return list_users()
