import requests
import json

s = requests.Session()

# 1. Login user
res = s.post("http://localhost:8000/djangoapp/login", json={
    "userName": "testreviewer",
    "password": "password"
})
print("Login:", res.status_code, res.text)

# 2. Add review
payload = {
    "name": "Test Reviewer",
    "dealership": 1,
    "review": "Excellent service!",
    "purchase": True,
    "purchase_date": "2024-01-01",
    "car_make": "Toyota",
    "car_model": "Camry",
    "car_year": "2023"
}
res2 = s.post("http://localhost:8000/djangoapp/add_review", json=payload)
print("Add Review:", res2.status_code, res2.text)
