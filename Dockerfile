# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


FROM python:3.12-slim AS python-builder
WORKDIR /tmp/backend

COPY backend/requirements.txt ./
RUN pip install --upgrade pip && \
    pip wheel --wheel-dir /tmp/wheels -r requirements.txt


FROM debian:bookworm-slim AS cpp-builder
WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        cmake \
        git \
        pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY cpp /app/cpp
COPY capnproto-c++-1.5.0 /app/capnproto-c++-1.5.0

RUN cmake -S /app/cpp -B /app/cpp/build -DCMAKE_BUILD_TYPE=Release && \
    cmake --build /app/cpp/build --config Release -j"$(nproc)" && \
    cp /app/cpp/build/benchmark /app/benchmark


FROM python:3.12-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    BENCHMARK_EXE=/app/build/benchmark

WORKDIR /app/backend

RUN adduser --disabled-password --gecos "" appuser

COPY --from=python-builder /tmp/wheels /tmp/wheels
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir /tmp/wheels/* && rm -rf /tmp/wheels

# Backend source
COPY backend/ ./

# Built frontend assets served by FastAPI at "/"
COPY --from=frontend-builder /app/frontend/dist ./assets

RUN mkdir -p /app/build
COPY --from=cpp-builder /app/benchmark /app/build/benchmark

RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
