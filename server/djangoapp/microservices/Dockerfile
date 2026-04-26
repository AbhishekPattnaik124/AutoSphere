# ============================================================
# Flask Sentiment Analyzer — Multi-Stage Dockerfile
# Stage 1: install heavy deps (torch ~700MB download, once)
# Stage 2: lean runtime
# ============================================================

FROM python:3.11-slim-bookworm AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip \
 && pip install --prefix=/install --no-cache-dir -r requirements.txt

# Pre-download NLTK VADER data
RUN python -c "import nltk; nltk.download('vader_lexicon', quiet=True)"

# ── Runtime stage ─────────────────────────────────────────
FROM python:3.11-slim-bookworm AS runtime

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY --from=builder /install /usr/local
COPY --from=builder /root/nltk_data /root/nltk_data

COPY . .

RUN mkdir -p /app/model_cache

EXPOSE 5050

HEALTHCHECK --interval=30s --timeout=15s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5050/health')" || exit 1

CMD ["python", "app.py"]
