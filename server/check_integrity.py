import os
import django
from django.conf import settings
from django.db import connection
import requests

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangoproj.settings')
django.setup()

def check_django_db():
    print("--- Checking Django Database ---")
    try:
        connection.ensure_connection()
        print("OK: Django Database is CONNECTED")
    except Exception as e:
        print(f"ERROR: Django Database FAILED ({e})")

def check_microservices():
    services = {
        "Dealer API": "http://localhost:3030/health",
        "Inventory API": "http://localhost:3050/health",
        "Sentiment API": "http://localhost:5050/health",
        "Django Health": "http://localhost:8000/api/health/"
    }
    
    print("\n--- Checking Microservices Status ---")
    for name, url in services.items():
        try:
            res = requests.get(url, timeout=2)
            if res.status_code == 200:
                print(f"ONLINE: {name} (Status: {res.json().get('status', 'OK')})")
            else:
                print(f"DEGRADED: {name} (HTTP {res.status_code})")
        except Exception:
            print(f"OFFLINE: {name} (Unreachable)")

if __name__ == "__main__":
    check_django_db()
    check_microservices()
