from pydantic import BaseModel
from typing import Optional


class UserResponse(BaseModel):
    """Datos del usuario que se devuelven al frontend."""
    id: int
    google_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: str
    last_login: str


class UserCreate(BaseModel):
    """Datos que llegan de Google para crear/actualizar un usuario."""
    google_id: str
    email: str
    name: str
    picture: Optional[str] = None
