FROM python:3.9-slim

WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements y reinstalar
COPY api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código del backend (incluyendo el simulador que está en el directorio padre si aplica)
# NOTA: En docker-compose montaremos el código para que tenga acceso a riscv_core.
# Por lo tanto, el build context debe ser la raíz del proyecto.
COPY api/ /app/api/
COPY riscv_core/ /app/riscv_core/

WORKDIR /app/api

EXPOSE 8000

# Usamos uvicorn para ejecutar la app usando la variable de entorno PORT
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
