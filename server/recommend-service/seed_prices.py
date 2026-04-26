"""
seed_prices.py — Generates 500 synthetic car price records for Ridge Regression training.
Run: python seed_prices.py
Outputs: data/price_seed.json
"""

import json
import random
import os

random.seed(42)

MAKES = {
    "Toyota": ["Camry", "Corolla", "RAV4", "Highlander", "Tacoma"],
    "Honda":  ["Civic", "Accord", "CR-V", "Pilot", "Odyssey"],
    "Ford":   ["F-150", "Mustang", "Explorer", "Escape", "Edge"],
    "Chevrolet": ["Silverado", "Malibu", "Equinox", "Traverse", "Camaro"],
    "BMW":    ["3 Series", "5 Series", "X3", "X5", "7 Series"],
    "Tesla":  ["Model 3", "Model Y", "Model S", "Model X"],
    "Hyundai":["Elantra", "Sonata", "Tucson", "Santa Fe"],
    "Kia":    ["Forte", "Optima", "Sorento", "Sportage"],
    "Jeep":   ["Wrangler", "Cherokee", "Grand Cherokee", "Compass"],
    "Nissan": ["Altima", "Sentra", "Rogue", "Pathfinder", "Frontier"],
}

BASE_PRICES = {
    "Toyota": 28000, "Honda": 27000, "Ford": 32000,
    "Chevrolet": 30000, "BMW": 55000, "Tesla": 48000,
    "Hyundai": 24000, "Kia": 23000, "Jeep": 38000, "Nissan": 26000,
}

records = []
for i in range(500):
    make = random.choice(list(MAKES.keys()))
    model = random.choice(MAKES[make])
    year = random.randint(2010, 2024)
    mileage = random.randint(0, 200000)
    base = BASE_PRICES[make]

    # Price formula: base - depreciation by year + mileage penalty ± noise
    year_factor = 1.0 - (2024 - year) * 0.06
    mileage_factor = 1.0 - (mileage / 200000) * 0.35
    noise = random.uniform(0.88, 1.12)
    price = max(5000, int(base * year_factor * mileage_factor * noise))

    records.append({
        "make": make,
        "model": model,
        "year": year,
        "mileage": mileage,
        "price": price,
    })

os.makedirs("data", exist_ok=True)
with open("data/price_seed.json", "w") as f:
    json.dump(records, f, indent=2)

print(f"Generated {len(records)} price records → data/price_seed.json")
