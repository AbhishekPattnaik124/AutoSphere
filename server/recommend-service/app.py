"""
Best Cars — AI Recommendation & Price Intelligence Service (v1.0)
Port: 3070

Endpoints:
  GET  /                          — Service info + model status
  GET  /health                    — Health check
  POST /recommend                 — Car recommendations (TF-IDF cosine similarity)
  GET  /recommend/explain/{car_id} — Human-readable recommendation explanation
  POST /price/predict             — Fair price prediction (Ridge Regression)
"""

import os
import time
import logging
import json
import psutil
from datetime import datetime
from threading import Thread

from flask import Flask, request, jsonify
from flask_cors import CORS

import recommender
import price_predictor

# ── Logging ───────────────────────────────────────────────
logging.basicConfig(
    format="[%(levelname)s] %(asctime)s %(name)s — %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# ── App ───────────────────────────────────────────────────
app = Flask("RecommendService")
CORS(app)

SERVICE_START = time.time()
_index_ready = False
_model_ready = False


def _startup():
    """Build ML models in background so the service starts fast."""
    global _index_ready, _model_ready
    logger.info("Building recommendation index...")
    _index_ready = recommender.build_index()
    logger.info("Training price model...")
    _model_ready = price_predictor.train_model()
    logger.info(f"AI Layer ready — index={_index_ready}, price_model={_model_ready}")


# Start background initialization
Thread(target=_startup, daemon=True).start()


# ══════════════════════════════════════════════════════════
# Routes
# ══════════════════════════════════════════════════════════

@app.get("/")
def home():
    return jsonify({
        "service": "recommend-service",
        "version": "1.0.0",
        "endpoints": ["/health", "/recommend", "/recommend/explain/<car_id>", "/price/predict"],
        "models": {"recommendation_index": _index_ready, "price_model": _model_ready},
    })


@app.get("/health")
def health():
    mem = psutil.virtual_memory()
    return jsonify({
        "service": "recommend-service",
        "version": "1.0.0",
        "status": "healthy" if _index_ready or _model_ready else "initializing",
        "uptime_seconds": round(time.time() - SERVICE_START, 1),
        "models": {
            "recommendation_index": _index_ready,
            "price_predictor": _model_ready,
        },
        "memory": {
            "used_mb": round(mem.used / 1024 / 1024),
            "percent": mem.percent,
        },
        "timestamp": datetime.utcnow().isoformat() + "Z",
    })


@app.post("/recommend")
def recommend():
    """
    POST /recommend
    Body: {
        "budget": 30000,
        "preferred_make": "Toyota",
        "usage_type": "city",       -- "city"|"highway"|"family"
        "fuel_preference": "gas",   -- "gas"|"electric"|"hybrid"
        "limit": 10
    }
    Returns ranked car recommendations with match_score and match_reason.
    """
    data = request.get_json(silent=True) or {}

    budget = int(data.get("budget", 0))
    preferred_make = str(data.get("preferred_make", "")).strip()
    usage_type = data.get("usage_type", "city")
    fuel_preference = data.get("fuel_preference", "gas")
    limit = min(20, int(data.get("limit", 10)))

    if not _index_ready:
        return jsonify({
            "warning": "Recommendation index is still building. Try again in 30 seconds.",
            "results": [],
        }), 202

    results = recommender.get_recommendations(
        budget=budget,
        preferred_make=preferred_make,
        usage_type=usage_type,
        fuel_preference=fuel_preference,
        top_n=limit,
    )

    return jsonify({
        "count": len(results),
        "preferences": {
            "budget": budget,
            "preferred_make": preferred_make,
            "usage_type": usage_type,
            "fuel_preference": fuel_preference,
        },
        "results": results,
    })


@app.get("/recommend/explain/<car_id>")
def explain(car_id):
    """
    GET /recommend/explain/{car_id}
    Returns a human-readable explanation of why this car would be recommended.
    Optional query params: budget, preferred_make, usage_type, fuel_preference
    """
    budget = int(request.args.get("budget", 0))
    preferred_make = request.args.get("preferred_make", "")
    usage_type = request.args.get("usage_type", "city")
    fuel_preference = request.args.get("fuel_preference", "gas")

    result = recommender.explain_car(
        car_id=car_id,
        budget=budget,
        preferred_make=preferred_make,
        usage_type=usage_type,
        fuel_preference=fuel_preference,
    )
    return jsonify(result)


@app.post("/price/predict")
def price_predict():
    """
    POST /price/predict
    Body: { "make": "Toyota", "model": "Camry", "year": 2020, "mileage": 45000, "actual_price": 24000 }
    Returns: { predicted_fair_price, price_rating, confidence_score }
    """
    data = request.get_json(silent=True) or {}

    make = str(data.get("make", "")).strip()
    model = str(data.get("model", "")).strip()
    year = int(data.get("year", 2020))
    mileage = int(data.get("mileage", 0))
    actual_price = data.get("actual_price")

    if not make or not model:
        return jsonify({"error": "VALIDATION_ERROR", "message": "make and model are required"}), 400

    if not _model_ready:
        return jsonify({"warning": "Price model is initializing. Try again in 20 seconds."}), 202

    prediction = price_predictor.predict_price(make, model, year, mileage)

    if "error" in prediction:
        return jsonify(prediction), 500

    # Add price rating if actual price was provided
    if actual_price is not None:
        prediction["actual_price"] = int(actual_price)
        prediction["price_rating"] = price_predictor.rate_price(
            int(actual_price), prediction["predicted_fair_price"]
        )
        diff = int(actual_price) - prediction["predicted_fair_price"]
        prediction["price_difference"] = diff
        prediction["price_difference_pct"] = round((diff / prediction["predicted_fair_price"]) * 100, 1)
    else:
        prediction["price_rating"] = "N/A (no actual price provided)"

    return jsonify(prediction)


# ── Error handlers ────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "NOT_FOUND", "message": str(e)}), 404

@app.errorhandler(500)
def server_error(e):
    logger.error(f"Unhandled error: {e}")
    return jsonify({"error": "INTERNAL_ERROR", "message": "An unexpected error occurred"}), 500


if __name__ == "__main__":
    logger.info("Starting AI Recommendation & Price Intelligence Service on port 3070")
    app.run(host="0.0.0.0", port=3070, debug=False)
