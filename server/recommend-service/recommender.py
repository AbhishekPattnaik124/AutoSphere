"""
recommender.py — TF-IDF cosine similarity recommendation engine.

At startup:
  1. Fetches all cars from the inventory service.
  2. Builds a text description for each car.
  3. Fits a TF-IDF vectorizer on all descriptions.
  4. On each recommendation request, encodes the user preference
     vector and returns top-N most similar cars.
"""

import logging
import os
import requests
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

INVENTORY_URL = os.getenv("INVENTORY_SERVICE_URL", "http://localhost:3050")
USAGE_KEYWORDS = {
    "city":     "compact fuel-efficient small urban commuter low mileage",
    "highway":  "highway long-distance sedan comfortable cruise efficient",
    "family":   "SUV spacious minivan seats safety large cargo family",
}
FUEL_KEYWORDS = {
    "gas":      "gasoline petrol V6 V8 horsepower engine",
    "electric": "electric battery EV zero emission range charging Tesla",
    "hybrid":   "hybrid plug-in fuel economy mpg eco green",
}

# Global state — built once at startup
_vectorizer: TfidfVectorizer | None = None
_car_vectors = None
_cars: list[dict] = []


def _build_car_description(car: dict) -> str:
    """Compose a rich text description for TF-IDF vectorization."""
    parts = [
        str(car.get("make", "")),
        str(car.get("model", "")),
        str(car.get("year", "")),
        str(car.get("bodyType", car.get("body_type", ""))),
        "mileage", str(car.get("mileage", 0)),
        "price", str(car.get("price", 0)),
    ]
    return " ".join(p for p in parts if p).lower()


def _build_preference_text(budget: int, preferred_make: str,
                            usage_type: str, fuel_preference: str) -> str:
    """Build a query vector string from user preferences."""
    parts = [
        preferred_make.lower() if preferred_make else "",
        USAGE_KEYWORDS.get(usage_type, ""),
        FUEL_KEYWORDS.get(fuel_preference, ""),
        f"price {budget}" if budget else "",
    ]
    return " ".join(p for p in parts if p)


def build_index() -> bool:
    """
    Fetch all cars and build the TF-IDF index.
    Called once at service startup. Returns True on success.
    """
    global _vectorizer, _car_vectors, _cars

    try:
        logger.info("Building recommendation index from inventory service...")
        # Fetch all dealers, then their cars
        dealers_resp = requests.get(f"{INVENTORY_URL}/cars/1", timeout=10)
        # Simplified: fetch cars from dealer 1 as a seed (in production, paginate all dealers)
        all_cars = []
        for dealer_id in range(1, 30):  # Try up to 30 dealers
            try:
                r = requests.get(f"{INVENTORY_URL}/cars/{dealer_id}?limit=100", timeout=5)
                if r.status_code == 200:
                    data = r.json()
                    cars = data.get("cars", data) if isinstance(data, dict) else data
                    for car in cars:
                        car["_dealer_id"] = dealer_id
                    all_cars.extend(cars)
            except Exception:
                continue

        if not all_cars:
            logger.warning("No cars fetched — using empty index")
            _cars = []
            return False

        _cars = all_cars
        descriptions = [_build_car_description(c) for c in _cars]
        _vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
        _car_vectors = _vectorizer.fit_transform(descriptions)
        logger.info(f"Recommendation index built with {len(_cars)} cars")
        return True

    except Exception as e:
        logger.error(f"Failed to build recommendation index: {e}")
        return False


def get_recommendations(budget: int, preferred_make: str,
                        usage_type: str, fuel_preference: str,
                        top_n: int = 10) -> list[dict]:
    """
    Return top-N car recommendations ranked by cosine similarity.

    Args:
        budget:          Max price in USD.
        preferred_make:  Car make preference (e.g. "Toyota"). Empty = any.
        usage_type:      "city" | "highway" | "family"
        fuel_preference: "gas" | "electric" | "hybrid"
        top_n:           Number of results to return.

    Returns:
        List of car dicts with added 'match_score' and 'match_reason' fields.
    """
    if _vectorizer is None or _car_vectors is None or not _cars:
        return []

    pref_text = _build_preference_text(budget, preferred_make, usage_type, fuel_preference)
    pref_vector = _vectorizer.transform([pref_text])
    scores = cosine_similarity(pref_vector, _car_vectors)[0]

    # Filter by budget first
    candidates = []
    for idx, car in enumerate(_cars):
        price = car.get("price", 0) or 0
        if budget and price > budget:
            continue
        candidates.append((idx, float(scores[idx]), car))

    # Sort by similarity score descending
    candidates.sort(key=lambda x: x[1], reverse=True)
    top = candidates[:top_n]

    results = []
    for idx, score, car in top:
        match_pct = round(score * 100, 1)
        reasons = _explain_match(car, budget, preferred_make, usage_type, fuel_preference)
        results.append({
            **car,
            "match_score": match_pct,
            "match_reason": reasons,
            "car_id": str(car.get("_id", car.get("id", idx))),
        })

    return results


def explain_car(car_id: str, budget: int = None, preferred_make: str = "",
                usage_type: str = "city", fuel_preference: str = "gas") -> dict:
    """
    Return a human-readable recommendation explanation for a specific car.
    """
    car = next((c for c in _cars if str(c.get("_id", c.get("id", ""))) == car_id), None)
    if not car:
        return {"error": "Car not found in recommendation index"}

    reasons = _explain_match(car, budget, preferred_make, usage_type, fuel_preference)
    return {
        "car_id": car_id,
        "make": car.get("make"),
        "model": car.get("model"),
        "year": car.get("year"),
        "price": car.get("price"),
        "explanation": reasons,
        "human_summary": f"This {car.get('year')} {car.get('make')} {car.get('model')} "
                         f"{'is within your budget' if budget and car.get('price', 0) <= budget else 'may stretch your budget'}, "
                         f"suitable for {usage_type} driving, and runs on {fuel_preference}.",
    }


def _explain_match(car: dict, budget: int, preferred_make: str,
                   usage_type: str, fuel_preference: str) -> list[str]:
    """Generate human-readable match reasons for a car."""
    reasons = []
    price = car.get("price", 0) or 0
    make = car.get("make", "").lower()
    mileage = car.get("mileage", 0) or 0

    if budget and price <= budget:
        reasons.append(f"✓ Within budget (${price:,} ≤ ${budget:,})")
    if preferred_make and make == preferred_make.lower():
        reasons.append(f"✓ Preferred brand ({car.get('make')})")
    if mileage < 50000:
        reasons.append("✓ Low mileage")
    elif mileage < 100000:
        reasons.append("✓ Moderate mileage")
    if usage_type == "family" and car.get("bodyType", "").lower() in ("suv", "minivan", "van"):
        reasons.append("✓ Great for families (SUV/Minivan)")
    if usage_type == "city" and car.get("bodyType", "").lower() in ("sedan", "hatchback", "compact"):
        reasons.append("✓ Ideal for city driving")
    if not reasons:
        reasons.append("Good overall match for your preferences")
    return reasons
