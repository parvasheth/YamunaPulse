# Stage 1: Build the React 19 Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci || npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Unified Python + FastAPI Production Server
FROM python:3.11-slim
WORKDIR /app

# Install basic build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python backend dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy application files, configs, and pre-seeded DuckDB analytical database
COPY backend/ ./backend/
COPY config/ ./config/
COPY data/ ./data/

# Copy compiled frontend from Stage 1 into frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Default Port configuration (Render/Railway/Hugging Face supply PORT dynamically)
ENV PORT=8000
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Start FastAPI with Uvicorn on dynamic PORT
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

