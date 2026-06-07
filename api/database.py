"""
database.py — Gestión de la base de datos SQLite para usuarios.

Crea y mantiene la tabla `users`. Provee funciones CRUD simples
para crear, actualizar y consultar usuarios autenticados con Google.
"""
import sqlite3
from contextlib import contextmanager
from typing import Optional
from models.user import UserCreate, UserResponse

DB_PATH = "users.db"


def get_connection() -> sqlite3.Connection:
    """Abre una conexión a la base de datos con row_factory para acceso por nombre."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def get_db():
    """Context manager que garantiza cierre de la conexión."""
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    """Crea la tabla `users` si no existe. Se llama al arrancar la app."""
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                google_id   TEXT    UNIQUE NOT NULL,
                email       TEXT    UNIQUE NOT NULL,
                name        TEXT    NOT NULL,
                picture     TEXT,
                created_at  TEXT    DEFAULT (datetime('now')),
                last_login  TEXT    DEFAULT (datetime('now'))
            )
        """)
    print("[DB] Tabla 'users' lista en", DB_PATH)


# ─── CRUD ─────────────────────────────────────────────────────────────────────

def get_user_by_google_id(google_id: str) -> Optional[UserResponse]:
    """Devuelve el usuario con ese google_id, o None si no existe."""
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE google_id = ?", (google_id,)
        ).fetchone()
    if row is None:
        return None
    return UserResponse(**dict(row))


def get_user_by_id(user_id: int) -> Optional[UserResponse]:
    """Devuelve el usuario por su id interno."""
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE id = ?", (user_id,)
        ).fetchone()
    if row is None:
        return None
    return UserResponse(**dict(row))


def create_or_update_user(data: UserCreate) -> UserResponse:
    """
    Inserta el usuario si no existe (por google_id).
    Si ya existe, actualiza nombre, foto y last_login.
    Devuelve el usuario actualizado.
    """
    with get_db() as conn:
        conn.execute("""
            INSERT INTO users (google_id, email, name, picture)
            VALUES (:google_id, :email, :name, :picture)
            ON CONFLICT(google_id) DO UPDATE SET
                name       = excluded.name,
                picture    = excluded.picture,
                last_login = datetime('now')
        """, data.model_dump())
        row = conn.execute(
            "SELECT * FROM users WHERE google_id = ?", (data.google_id,)
        ).fetchone()
    return UserResponse(**dict(row))


def list_users() -> list[UserResponse]:
    """Devuelve todos los usuarios registrados."""
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM users ORDER BY created_at DESC").fetchall()
    return [UserResponse(**dict(r)) for r in rows]
