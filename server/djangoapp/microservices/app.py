"""
Best Cars — Sentiment Analyzer Microservice (v2.0)
Port: 5050

Upgraded NLP pipeline:
  - Primary:  distilbert-base-uncased-finetuned-sst-2-english (Hugging Face)
  - Fallback: VADER (NLTK) — activates if transformers unavailable or USE_VADER_ONLY=true

Endpoints:
  GET  /                       — Service info
  GET  /health                 — Health status + model info
  GET  /analyze/<text>         — Single text analysis
  POST /analyze/batch          — Batch analysis (up to 50 texts)
  GET  /analytics/dealer/<id>  — Sentiment trend (requires review store)
"""

import os
import json
import time
import logging
import psutil
import platform
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
from flask import Flask, request, jsonify
from flask_cors import CORS
from nltk.sentiment import SentimentIntensityAnalyzer
import nltk

# ── Logging setup ─────────────────────────────────────────
logging.basicConfig(
    format='%(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

def log(level, message, **kwargs):
    """Emit a structured JSON log line."""
    entry = {
        "time": datetime.utcnow().isoformat() + "Z",
        "service": "sentiment-analyzer",
        "level": level.upper(),
        "message": message,
        **kwargs
    }
    print(json.dumps(entry))


# ── Download VADER data ────────────────────────────────────
nltk.download('vader_lexicon', quiet=True)

# ── App setup ──────────────────────────────────────────────
app = Flask("SentimentAnalyzer")
CORS(app)

SERVICE_START = time.time()
MODEL_CACHE_DIR = os.getenv("MODEL_CACHE_DIR", "./model_cache")
USE_VADER_ONLY = os.getenv("USE_VADER_ONLY", "false").lower() == "true"

# ── Load models ────────────────────────────────────────────
vader_analyzer = SentimentIntensityAnalyzer()
transformer_pipeline = None
active_model = "vader"

if not USE_VADER_ONLY:
    try:
        from transformers import pipeline as hf_pipeline
        log("INFO", "Loading distilbert model — this takes ~10s on first run...")
        os.makedirs(MODEL_CACHE_DIR, exist_ok=True)
        transformer_pipeline = hf_pipeline(
            "sentiment-analysis",
            model="distilbert-base-uncased-finetuned-sst-2-english",
            cache_dir=MODEL_CACHE_DIR,
            truncation=True,
            max_length=512,
        )
        active_model = "distilbert-sst2"
        log("INFO", "distilbert model loaded successfully", model=active_model)
    except Exception as e:
        log("WARN", "Transformer unavailable — falling back to VADER", error=str(e))
        transformer_pipeline = None
        active_model = "vader-fallback"
else:
    log("INFO", "USE_VADER_ONLY=true — skipping transformer download", model="vader")


# ══════════════════════════════════════════════════════════
# Core analysis functions
# ══════════════════════════════════════════════════════════

def analyze_with_transformer(text: str) -> dict:
    """
    Analyze sentiment using distilbert.

    Returns:
        dict: { sentiment, confidence, model }
    """
    result = transformer_pipeline(text)[0]
    label = result['label']  # 'POSITIVE' or 'NEGATIVE'
    score = result['score']

    # distilbert returns only POSITIVE/NEGATIVE — derive neutral from low confidence
    if score < 0.65:
        sentiment = "neutral"
    elif label == "POSITIVE":
        sentiment = "positive"
    else:
        sentiment = "negative"

    return {
        "sentiment": sentiment,
        "confidence": round(score, 4),
        "model": active_model,
    }


def analyze_with_vader(text: str) -> dict:
    """
    Analyze sentiment using VADER (NLTK).

    Returns:
        dict: { sentiment, confidence, model }
    """
    scores = vader_analyzer.polarity_scores(text)
    pos, neg, neu, compound = scores['pos'], scores['neg'], scores['neu'], scores['compound']

    if neg > pos and neg > neu:
        sentiment = "negative"
        confidence = round(neg, 4)
    elif neu > neg and neu > pos:
        sentiment = "neutral"
        confidence = round(neu, 4)
    else:
        sentiment = "positive"
        confidence = round(pos, 4)

    return {
        "sentiment": sentiment,
        "confidence": confidence,
        "compound": round(compound, 4),
        "model": "vader",
    }


def analyze_text(text: str) -> dict:
    """
    Route to the best available model.
    Falls back to VADER if transformer fails at runtime.
    """
    if not text or not text.strip():
        return {"sentiment": "neutral", "confidence": 0.5, "model": active_model}

    text_clean = str(text).strip()[:2000]  # Truncate safely

    if transformer_pipeline is not None:
        try:
            return analyze_with_transformer(text_clean)
        except Exception as e:
            log("WARN", "Transformer inference failed, using VADER", error=str(e))
            return analyze_with_vader(text_clean)
    else:
        return analyze_with_vader(text_clean)


# ══════════════════════════════════════════════════════════
# Routes
# ══════════════════════════════════════════════════════════

@app.get('/')
def home():
    return jsonify({
        "service": "sentiment-analyzer",
        "version": "2.0.0",
        "active_model": active_model,
        "endpoints": ["/health", "/analyze/<text>", "/analyze/batch"],
        "message": "Best Cars Sentiment Analysis API"
    })


@app.get('/health')
def health():
    """
    Health endpoint — returns service and model status.
    """
    uptime = round(time.time() - SERVICE_START, 1)
    mem = psutil.virtual_memory()

    return jsonify({
        "service": "sentiment-analyzer",
        "version": "2.0.0",
        "status": "healthy",
        "uptime_seconds": uptime,
        "active_model": active_model,
        "model_ready": transformer_pipeline is not None or active_model == "vader",
        "memory": {
            "used_mb": round(mem.used / 1024 / 1024),
            "total_mb": round(mem.total / 1024 / 1024),
            "percent": mem.percent,
        },
        "platform": platform.python_version(),
        "timestamp": datetime.utcnow().isoformat() + "Z",
    })


@app.get('/analyze/<path:input_txt>')
def analyze_sentiment(input_txt):
    """
    Analyze a single text string.

    Returns:
        JSON: { sentiment, confidence, model }
    """
    trace_id = request.headers.get('X-Trace-Id', f"sa-{int(time.time())}")
    start = time.time()

    result = analyze_text(input_txt)

    log("INFO", "Single analysis complete",
        traceId=trace_id,
        sentiment=result['sentiment'],
        model=result['model'],
        ms=round((time.time() - start) * 1000, 1))

    return jsonify(result)


@app.post('/analyze/batch')
def analyze_batch():
    """
    Batch sentiment analysis — up to 50 texts processed in parallel.

    Request body: { "texts": ["text1", "text2", ...] }
    Returns: { "results": [{ "text", "sentiment", "confidence", "model" }] }
    """
    trace_id = request.headers.get('X-Trace-Id', f"sa-batch-{int(time.time())}")
    start = time.time()

    data = request.get_json(silent=True)
    if not data or 'texts' not in data:
        return jsonify({"error": "VALIDATION_ERROR", "message": "Request body must be { 'texts': [...] }"}), 400

    texts = data['texts']
    if not isinstance(texts, list):
        return jsonify({"error": "VALIDATION_ERROR", "message": "'texts' must be an array"}), 400

    if len(texts) > 50:
        return jsonify({"error": "BATCH_TOO_LARGE", "message": "Maximum 50 texts per batch request"}), 400

    results = []
    with ThreadPoolExecutor(max_workers=min(len(texts), 8)) as executor:
        future_to_text = {executor.submit(analyze_text, text): text for text in texts}
        for future in as_completed(future_to_text):
            text = future_to_text[future]
            try:
                analysis = future.result()
                results.append({"text": text[:100] + "..." if len(text) > 100 else text, **analysis})
            except Exception as e:
                results.append({"text": text[:100], "error": str(e), "sentiment": "neutral", "confidence": 0, "model": "error"})

    log("INFO", "Batch analysis complete",
        traceId=trace_id,
        count=len(results),
        ms=round((time.time() - start) * 1000, 1))

    return jsonify({
        "results": results,
        "count": len(results),
        "model": active_model,
        "processing_ms": round((time.time() - start) * 1000, 1),
    })


@app.get('/analytics/dealer/<dealer_id>')
def dealer_analytics(dealer_id):
    """
    Return daily sentiment distribution for the past N days.
    (Stub implementation — reads from review data if available,
     returns sample structure for frontend integration.)

    Query params:
        days (int): Number of days to look back (default: 30)
    """
    days = min(90, int(request.args.get('days', 30)))
    today = datetime.utcnow()

    # Generate placeholder trend data structure
    # In production this queries the review MongoDB via dealer service
    trend = []
    for i in range(days):
        day = today - timedelta(days=(days - 1 - i))
        trend.append({
            "date": day.strftime("%Y-%m-%d"),
            "positive": 0,
            "neutral": 0,
            "negative": 0,
        })

    return jsonify({
        "dealer_id": dealer_id,
        "days": days,
        "trend": trend,
        "model": active_model,
        "note": "Connect to review MongoDB for live data",
    })


# ── Error handlers ────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "NOT_FOUND", "message": str(e)}), 404


@app.errorhandler(500)
def server_error(e):
    log("ERROR", "Unhandled exception", error=str(e))
    return jsonify({"error": "INTERNAL_ERROR", "message": "An unexpected error occurred"}), 500


if __name__ == "__main__":
    log("INFO", "Starting Sentiment Analyzer", model=active_model, port=5050)
    app.run(debug=False, host="0.0.0.0", port=5050)
