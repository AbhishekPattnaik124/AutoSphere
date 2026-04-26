"""
price_predictor.py — Ridge Regression model for fair price prediction.

At startup:
  1. Loads or generates synthetic training data (500 records).
  2. Trains a Ridge Regression model on make/model/year/mileage features.
  3. Persists the model to models/price_model.joblib.
  4. Exposes predict(make, model, year, mileage) → predicted price + rating.
"""

import os
import json
import logging
import numpy as np
import joblib
from sklearn.linear_model import Ridge
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.pipeline import Pipeline

logger = logging.getLogger(__name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "price_model.joblib")
SEED_DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "price_seed.json")

# Global model
_model: Pipeline | None = None
_make_encoder: LabelEncoder | None = None
_model_encoder: LabelEncoder | None = None
_known_makes: set = set()
_known_models: set = set()

RATING_THRESHOLDS = {
    "great_deal": 0.88,   # Actual price ≤ 88% of predicted → Great Deal
    "fair":       1.12,   # Actual price ≤ 112% of predicted → Fair
    # Otherwise → Overpriced
}


def _load_seed_data() -> list[dict]:
    """Load synthetic price seed data, generating it if missing."""
    if not os.path.exists(SEED_DATA_PATH):
        logger.info("Seed data not found — generating 500 records...")
        import subprocess, sys
        subprocess.run([sys.executable, os.path.join(os.path.dirname(__file__), "seed_prices.py")],
                       cwd=os.path.dirname(__file__))
    with open(SEED_DATA_PATH) as f:
        return json.load(f)


def _build_features(records: list[dict], make_enc: LabelEncoder, model_enc: LabelEncoder) -> np.ndarray:
    """Build feature matrix: [make_encoded, model_encoded, year, mileage_normalized]"""
    X = []
    for r in records:
        try:
            make_idx = make_enc.transform([r["make"]])[0]
        except ValueError:
            make_idx = -1
        try:
            model_idx = model_enc.transform([r["model"]])[0]
        except ValueError:
            model_idx = -1
        X.append([make_idx, model_idx, r["year"], r["mileage"] / 200000.0])
    return np.array(X)


def train_model() -> bool:
    """
    Train or load the Ridge Regression price model.
    Called once at service startup. Returns True on success.
    """
    global _model, _make_encoder, _model_encoder, _known_makes, _known_models

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

    # Load from disk if already trained
    if os.path.exists(MODEL_PATH):
        try:
            saved = joblib.load(MODEL_PATH)
            _model = saved["model"]
            _make_encoder = saved["make_enc"]
            _model_encoder = saved["model_enc"]
            _known_makes = set(_make_encoder.classes_)
            _known_models = set(_model_encoder.classes_)
            logger.info("Price model loaded from cache")
            return True
        except Exception as e:
            logger.warning(f"Failed to load cached model: {e} — retraining")

    try:
        data = _load_seed_data()
        makes = [r["make"] for r in data]
        models = [r["model"] for r in data]

        _make_encoder = LabelEncoder().fit(makes)
        _model_encoder = LabelEncoder().fit(models)
        _known_makes = set(_make_encoder.classes_)
        _known_models = set(_model_encoder.classes_)

        X = _build_features(data, _make_encoder, _model_encoder)
        y = np.array([r["price"] for r in data])

        _model = Pipeline([
            ("scaler", StandardScaler()),
            ("ridge", Ridge(alpha=1.0)),
        ])
        _model.fit(X, y)

        joblib.dump({
            "model": _model,
            "make_enc": _make_encoder,
            "model_enc": _model_encoder,
        }, MODEL_PATH)

        logger.info(f"Price model trained on {len(data)} records and saved to {MODEL_PATH}")
        return True

    except Exception as e:
        logger.error(f"Failed to train price model: {e}")
        return False


def predict_price(make: str, model: str, year: int, mileage: int) -> dict:
    """
    Predict the fair market price for a car.

    Args:
        make:    Car manufacturer (e.g. "Toyota").
        model:   Car model (e.g. "Camry").
        year:    Model year (e.g. 2020).
        mileage: Odometer reading in miles.

    Returns:
        dict: { predicted_fair_price, price_rating, confidence_score, explanation }
    """
    if _model is None:
        return {"error": "Model not trained yet"}

    # Encode inputs (use -1 for unknown)
    try:
        make_idx = _make_encoder.transform([make])[0] if make in _known_makes else -1
    except Exception:
        make_idx = -1
    try:
        model_idx = _model_encoder.transform([model])[0] if model in _known_models else -1
    except Exception:
        model_idx = -1

    X = np.array([[make_idx, model_idx, year, mileage / 200000.0]])
    predicted = float(_model.predict(X)[0])
    predicted = max(3000, round(predicted, -2))  # Floor at $3000, round to nearest $100

    # Confidence: lower if make/model are unknown
    confidence = 0.92 if (make_idx != -1 and model_idx != -1) else 0.65

    return {
        "predicted_fair_price": int(predicted),
        "confidence_score": round(confidence, 2),
        "model": f"{make} {model} ({year})",
        "note": "Estimate based on 500-record Ridge Regression model",
    }


def rate_price(actual_price: int, predicted_price: int) -> str:
    """Return a human-readable price rating given actual vs predicted price."""
    if predicted_price <= 0:
        return "Unknown"
    ratio = actual_price / predicted_price
    if ratio <= RATING_THRESHOLDS["great_deal"]:
        return "Great Deal"
    elif ratio <= RATING_THRESHOLDS["fair"]:
        return "Fair Price"
    else:
        return "Overpriced"
