import requests
import json

def verify_data():
    print("--- Verifying Data Integrity ---")
    
    # 1. Check Dealers
    try:
        res = requests.get("http://localhost:3030/fetchDealers", timeout=2)
        dealers = res.json()
        print(f"DEALERS: Found {len(dealers)} dealerships in MongoDB.")
    except Exception as e:
        print(f"DEALERS: FAILED to fetch data ({e})")

    # 2. Check Inventory
    try:
        res = requests.get("http://localhost:3050/cars/1", timeout=2)
        inventory = res.json()
        count = len(inventory.get('cars', []))
        print(f"INVENTORY: Found {count} cars for Dealer ID 1.")
    except Exception as e:
        print(f"INVENTORY: FAILED to fetch data ({e})")

    # 3. Check NLP
    try:
        res = requests.get("http://localhost:5050/analyze/This is a fantastic car!", timeout=2)
        sentiment = res.json()
        print(f"NLP: Sentiment analysis is active. Result: {sentiment.get('sentiment')}")
    except Exception as e:
        print(f"NLP: FAILED ({e})")

if __name__ == "__main__":
    verify_data()
