FROM node:20-slim AS frontend-builder

WORKDIR /build

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

COPY --from=frontend-builder /build/dist ./static

EXPOSE 8000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port $PORT"]