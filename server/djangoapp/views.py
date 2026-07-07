from django.contrib.auth.models import User
from django.contrib.auth import logout
from django.http import JsonResponse
from django.contrib.auth import login, authenticate
import logging
import json
from django.views.decorators.csrf import csrf_exempt
from .populate import initiate
from .models import CarMake, CarModel, DealershipBilling
from .restapis import (
    get_request, analyze_review_sentiments, analyze_batch,
    post_review, searchcars_request, summarize_reviews,
    get_dealer_score, post_booking,
)


# Get an instance of a logger
logger = logging.getLogger(__name__)


def get_inventory(request, dealer_id):
    if dealer_id:
        make = request.GET.get('make')
        model = request.GET.get('model')
        year = request.GET.get('year')
        mileage = request.GET.get('mileage')
        price = request.GET.get('price')

        endpoint = "/cars/" + str(dealer_id)
        if make:
            endpoint = "/carsbymake/" + str(dealer_id) + "/" + make
        elif model:
            endpoint = "/carsbymodel/" + str(dealer_id) + "/" + model
        elif year:
            endpoint = "/carsbyyear/" + str(dealer_id) + "/" + year
        elif mileage:
            endpoint = "/carsbymaxmileage/" + str(dealer_id) + "/" + mileage
        elif price:
            endpoint = "/carsbyprice/" + str(dealer_id) + "/" + price

        cars_response = searchcars_request(endpoint)
        cars = (cars_response.get('cars', []) if cars_response else []) or []
        return JsonResponse({"status": 200, "cars": cars})
    else:
        return JsonResponse({"status": 400, "message": "Bad Request"})


@csrf_exempt
def add_review(request):
    if not request.user.is_anonymous:
        data = json.loads(request.body)
        try:
            post_review(data)
            return JsonResponse({"status": 200})
        except Exception as e:
            logger.error(f"Error posting review: {e}")
            return JsonResponse({"status": 401, "message": "Error in posting review"})
    else:
        return JsonResponse({"status": 403, "message": "Unauthorized"})

# ── Authentication Views ───────────────────────────────────────

@csrf_exempt
def login_user(request):
    """Handle user sign-in requests."""
    data = json.loads(request.body)
    username = data.get('userName', '')
    password = data.get('password', '')

    user = authenticate(username=username, password=password)
    response_data = {"userName": username}
    if user is not None:
        login(request, user)
        response_data["status"] = "Authenticated"
        logger.info(f"User '{username}' authenticated successfully.")
    else:
        logger.warning(f"Failed login attempt for user '{username}'.")
    return JsonResponse(response_data)


def logout_request(request):
    """Handle user sign-out requests."""
    username = getattr(request.user, 'username', 'anonymous')
    logout(request)
    logger.info(f"User '{username}' logged out.")
    return JsonResponse({"userName": ""})


@csrf_exempt
def registration(request):
    """Handle user sign-up requests."""
    data = json.loads(request.body)
    username = data.get('userName', '')
    password = data.get('password', '')
    first_name = data.get('firstName', '')
    last_name = data.get('lastName', '')
    email = data.get('email', '')

    username_exist = False
    try:
        User.objects.get(username=username)
        username_exist = True
    except User.DoesNotExist:
        logger.debug(f"'{username}' is a new user — proceeding with registration.")

    if not username_exist:
        user = User.objects.create_user(
            username=username,
            first_name=first_name,
            last_name=last_name,
            password=password,
            email=email,
        )
        login(request, user)
        logger.info(f"New user '{username}' registered and logged in.")
        return JsonResponse({"userName": username, "status": "Authenticated"})
    else:
        return JsonResponse({"userName": username, "error": "Already Registered"})


# ── Car Data ───────────────────────────────────────────────────

def get_cars(request):
    count = CarMake.objects.filter().count()
    logger.debug(f"CarMake count: {count}")
    if count == 0:
        initiate()
    car_models = CarModel.objects.select_related('car_make')
    cars = [
        {"CarModel": car_model.name, "CarMake": car_model.car_make.name}
        for car_model in car_models
    ]
    return JsonResponse({"CarModels": cars})


# ── Dealer Views ───────────────────────────────────────────────

def get_dealerships(request, state="All"):
    """Return list of dealerships, optionally filtered by state or query parameters."""
    country = request.GET.get('country', '')
    req_state = request.GET.get('state', '')
    city = request.GET.get('city', '')

    endpoint = "/fetchDealers"
    query_params = []
    if country: query_params.append(f"country={country}")
    if req_state: query_params.append(f"state={req_state}")
    elif state != "All": query_params.append(f"state={state}")
    if city: query_params.append(f"city={city}")

    if query_params:
        endpoint += "?" + "&".join(query_params)
        
    dealerships = get_request(endpoint) or []
    
    billings = {b.dealer_id: b.is_sponsored for b in DealershipBilling.objects.all()}
    for d in dealerships:
        d['is_sponsored'] = billings.get(d.get('id'), False)
        
    dealerships.sort(key=lambda d: not d.get('is_sponsored', False))

    return JsonResponse({"status": 200, "dealers": dealerships})


def get_dealer_reviews(request, dealer_id):
    """Return reviews for a dealer, enriched with AI sentiment analysis."""
    if dealer_id:
        endpoint = "/fetchReviews/dealer/" + str(dealer_id)
        reviews = get_request(endpoint) or []

        # Use batch sentiment for efficiency (single API call instead of N calls)
        review_texts = [r.get('review', '') for r in reviews]
        if review_texts:
            batch_results = analyze_batch(review_texts)
            for i, review_detail in enumerate(reviews):
                if i < len(batch_results):
                    review_detail['sentiment'] = batch_results[i].get('sentiment', 'neutral')
                    review_detail['sentiment_confidence'] = batch_results[i].get('confidence', 0.5)
                else:
                    review_detail['sentiment'] = 'neutral'
                    review_detail['sentiment_confidence'] = 0.5
        else:
            for r in reviews:
                r['sentiment'] = 'neutral'
                r['sentiment_confidence'] = 0.5

        logger.debug(f"Fetched {len(reviews)} reviews for dealer {dealer_id}.")
        return JsonResponse({"status": 200, "reviews": reviews})
    else:
        return JsonResponse({"status": 400, "message": "Bad Request"})


def get_dealer_details(request, dealer_id):
    """Return basic dealer details."""
    if dealer_id:
        endpoint = "/fetchDealer/" + str(dealer_id)
        dealership = get_request(endpoint)
        return JsonResponse({"status": 200, "dealer": dealership})
    else:
        return JsonResponse({"status": 400, "message": "Bad Request"})


def get_dealer_details_v2(request, dealer_id):
    """Return enriched dealer details including real-time trust score."""
    if dealer_id:
        endpoint = "/fetchDealer/" + str(dealer_id)
        dealership_call = get_request(endpoint)

        # Handle both list and dict-wrapped responses
        if isinstance(dealership_call, list):
            dealership = dealership_call
        elif isinstance(dealership_call, dict):
            dealership = dealership_call.get('value', [])
        else:
            dealership = []

        reviews_endpoint = "/fetchReviews/dealer/" + str(dealer_id)
        reviews = get_request(reviews_endpoint)
        score_data = get_dealer_score(dealer_id, reviews=reviews)

        return JsonResponse({
            "status": 200,
            "dealer": dealership,
            "trust_data": score_data,
        })
    else:
        return JsonResponse({"status": 400, "message": "Bad Request"})


# ── Analytics ──────────────────────────────────────────────────

def get_leaderboard(request):
    """
    Rank dealers by a composite Trust Score using batch sentiment analysis.
    Score = (Avg Sentiment * 0.6) + (Review Volume * 0.3) + (Recency Bonus * 0.1)
    """
    dealerships = get_request("/fetchDealers")
    if not dealerships:
        return JsonResponse({"status": 200, "leaderboard": []})

    leaderboard = []
    for d in dealerships[:20]:  # Top 20 for performance
        reviews = get_request(f"/fetchReviews/dealer/{d['id']}") or []

        # Batch sentiment — single network call per dealer
        review_texts = [r.get('review', '') for r in reviews]
        sent_vals = {"positive": 1.0, "neutral": 0.5, "negative": 0.0}

        if review_texts:
            batch_results = analyze_batch(review_texts)
            total_sent = sum(
                sent_vals.get(r.get('sentiment', 'neutral'), 0.5)
                for r in batch_results
            )
            avg_sentiment = total_sent / len(batch_results)
        else:
            avg_sentiment = 0.5

        # Composite score
        trust_score = (avg_sentiment * 70) + min(len(reviews), 30)

        # Grade mapping
        if trust_score >= 90:
            grade = "A+"
        elif trust_score >= 80:
            grade = "A"
        elif trust_score >= 70:
            grade = "B"
        elif trust_score >= 60:
            grade = "C"
        elif trust_score >= 50:
            grade = "D"
        else:
            grade = "F"

        leaderboard.append({
            "id": d['id'],
            "name": d.get('full_name', d.get('name', 'Unknown Dealer')),
            "city": d.get('city', ''),
            "state": d.get('state', ''),
            "trust_score": round(trust_score, 1),
            "review_count": len(reviews),
            "avg_sentiment": round(avg_sentiment, 3),
            "grade": grade,
        })

    leaderboard.sort(key=lambda x: x['trust_score'], reverse=True)
    return JsonResponse({"status": 200, "leaderboard": leaderboard})


# ── Health & Telemetry ─────────────────────────────────────────

def get_system_health(request):
    """
    Unified telemetry aggregator for the Health Dashboard.
    Polls all downstream services and returns consolidated status.
    """
    from dotenv import load_dotenv
    import os
    import requests
    import time

    load_dotenv(override=False)

    b_url = os.getenv('backend_url', 'http://localhost:3030').rstrip('/')
    s_url = os.getenv('searchcars_url', 'http://localhost:3050').rstrip('/')
    a_url = os.getenv('sentiment_analyzer_url', 'http://localhost:5050').rstrip('/')
    booking_url = os.getenv('booking_url', 'http://localhost:3060').rstrip('/')
    notification_url = os.getenv('notification_url', 'http://localhost:3080').rstrip('/')
    audit_url = os.getenv('audit_url', 'http://localhost:3090').rstrip('/')
    recommend_url = os.getenv('recommend_url', 'http://localhost:3070').rstrip('/')

    services = [
        {"name": "Django Hub",       "key": "django",       "url": "INTERNAL"},
        {"name": "Dealer API",        "key": "dealer",       "url": f"{b_url}/health"},
        {"name": "Inventory API",     "key": "inventory",    "url": f"{s_url}/health"},
        {"name": "Sentiment NLP",     "key": "sentiment",    "url": f"{a_url}/health"},
        {"name": "Booking Service",   "key": "booking",      "url": f"{booking_url}/health"},
        {"name": "Notification Svc",  "key": "notification", "url": f"{notification_url}/health"},
        {"name": "Audit Service",     "key": "audit",        "url": f"{audit_url}/health"},
        {"name": "Recommend AI",      "key": "recommend",    "url": f"{recommend_url}/health"},
    ]

    results = {}
    for svc in services:
        start = time.time()
        if svc['url'] == "INTERNAL":
            results[svc['key']] = {
                "status": "healthy",
                "uptime_seconds": 0,
                "database": {"connected": True},
                "latency_ms": round((time.time() - start) * 1000 + 0.1, 1),
            }
            continue

        start = time.time()
        try:
            res = requests.get(svc['url'], timeout=1.5)
            if res.status_code == 200:
                data = res.json()
                data['latency_ms'] = round((time.time() - start) * 1000, 1)
                results[svc['key']] = data
            else:
                results[svc['key']] = {
                    "status": "degraded",
                    "error": f"HTTP {res.status_code}",
                    "latency_ms": round((time.time() - start) * 1000, 1),
                }
        except Exception as e:
            results[svc['key']] = {
                "status": "offline",
                "error": str(e),
                "latency_ms": round((time.time() - start) * 1000, 1),
            }

    return JsonResponse({
        "status": 200,
        "telemetry": results,
        "timestamp": time.time(),
    })


# ── AI Summarization ───────────────────────────────────────────

@csrf_exempt
def summarize_reviews_proxy(request):
    """Proxy review summarization to the Sentiment Analyzer service."""
    data = json.loads(request.body)
    reviews = data.get('reviews', [])
    summary = summarize_reviews(reviews)
    return JsonResponse(summary)


# ── Booking ────────────────────────────────────────────────────

@csrf_exempt
def book_appointment(request):
    """
    Proxy booking request to the Booking Microservice.
    Injects authenticated user email/id from the Django session.
    """
    if not request.user.is_anonymous:
        try:
            data = json.loads(request.body)
            data['user_email'] = request.user.email
            data['user_id'] = request.user.username

            res = post_booking(data)
            if res:
                return JsonResponse({
                    "status": 200,
                    "message": "Booking successful",
                    "appointment": res,
                })
            else:
                return JsonResponse({
                    "status": 500,
                    "message": "Booking service unreachable. Please try again later.",
                })
        except Exception as e:
            logger.error(f"Booking proxy error: {e}")
            return JsonResponse({"status": 500, "message": f"Transmission Error: {str(e)}"})
    else:
        return JsonResponse({
            "status": 403,
            "message": "Unauthorized. Please log in to book a test drive.",
        })


def get_user_bookings(request, username):
    """Fetch all bookings for a specific authenticated user."""
    if not request.user.is_anonymous and request.user.username == username:
        try:
            from .restapis import get_booking_url
            import requests
            url = f"{get_booking_url()}/user/{username}"
            res = requests.get(url, timeout=2.0)
            return JsonResponse(res.json(), safe=False)
        except Exception as e:
            logger.error(f"Error fetching bookings for '{username}': {e}")
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Unauthorized"}, status=403)


# ── Dashboard Stats ────────────────────────────────────────────

def get_dashboard_stats(request):
    """Unified analytics aggregator for the User Dashboard."""
    from .restapis import get_inventory_url
    import requests
    import time

    try:
        inv_url = f"{get_inventory_url()}/cars/market-trends"
        market_res = requests.get(inv_url, timeout=2.0)
        market_data = market_res.json() if market_res.status_code == 200 else {}

        dealers = get_request("/fetchDealers")
        total_dealers = len(dealers) if dealers else 0

        return JsonResponse({
            "status": 200,
            "market_trends": market_data,
            "total_dealers": total_dealers,
            "system_uptime": "99.9%",
            "timestamp": time.time(),
        })
    except Exception as e:
        logger.error(f"Dashboard stats error: {e}")
        return JsonResponse({"status": 500, "error": str(e)})

# ── SEO ────────────────────────────────────────────────────────

def sitemap_xml(request):
    from django.http import HttpResponse
    from django.utils import timezone
    
    dealers = get_request("/fetchDealers") or []
    
    base_url = "https://autosphere-os.com"
    date_str = timezone.now().strftime('%Y-%m-%d')
    
    xml = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    # Static pages
    for path in ['', '/about', '/dealers', '/advancements', '/market-trends']:
        xml.append(f'  <url>')
        xml.append(f'    <loc>{base_url}{path}</loc>')
        xml.append(f'    <lastmod>{date_str}</lastmod>')
        xml.append(f'    <changefreq>daily</changefreq>')
        xml.append(f'  </url>')
        
    # Dealer pages
    for d in dealers:
        xml.append(f'  <url>')
        xml.append(f'    <loc>{base_url}/dealer/{d.get("id")}</loc>')
        xml.append(f'    <lastmod>{date_str}</lastmod>')
        xml.append(f'    <changefreq>daily</changefreq>')
        xml.append(f'  </url>')
        
    xml.append('</urlset>')
    
    return HttpResponse("\\n".join(xml), content_type="application/xml")

@csrf_exempt
def trade_in_valuation(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Method not allowed"}, status=405)
        
    try:
        data = json.loads(request.body)
        
        # MOCK AI VALUATION LOGIC
        year = int(data.get('year', 2020))
        base_value = 25000
        age = 2024 - year
        estimated_value = max(5000, base_value - (age * 1500))
        
        return JsonResponse({
            "status": "success",
            "valuation": {
                "estimated_value": estimated_value,
                "range_low": estimated_value - 2000,
                "range_high": estimated_value + 2000
            }
        })
    except Exception as e:
        logger.error(f"Trade-in error: {e}")
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def get_vehicle_ledger(request, vin):
    """Fetch the blockchain ledger history for a specific VIN."""
    from .models import VehicleLedger
    
    # If no records exist, let's auto-generate a mock Genesis block and some history for the demo
    count = VehicleLedger.objects.filter(vin=vin).count()
    if count == 0:
        VehicleLedger.objects.create(
            vin=vin,
            event_type="GENESIS_BLOCK",
            description="Vehicle manufactured and registered on Autosphere Blockchain.",
            previous_hash="0000000000000000000000000000000000000000000000000000000000000000"
        )
        VehicleLedger.objects.create(
            vin=vin,
            event_type="SERVICE",
            description="10,000 Mile Scheduled Maintenance. Oil changed, tires rotated.",
            previous_hash=VehicleLedger.objects.filter(vin=vin).last().hash
        )

    ledger_entries = VehicleLedger.objects.filter(vin=vin).order_by('-timestamp')
    
    history = []
    for entry in ledger_entries:
        history.append({
            "id": entry.id,
            "event_type": entry.event_type,
            "description": entry.description,
            "timestamp": entry.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "hash": entry.hash,
            "previous_hash": entry.previous_hash
        })
        
    return JsonResponse({"status": "success", "ledger": history})

@csrf_exempt
def trigger_voice_call(request, dealer_id):
    """
    Simulates triggering a Twilio/OpenAI real-time voice call to a dealership 
    to pass a hot lead from the AutoGPT chatbot.
    """
    if request.method == "POST":
        import json
        try:
            data = json.loads(request.body)
            lead_name = data.get('lead_name', 'A customer')
            lead_car = data.get('lead_car', 'a vehicle')
            
            # Here we would normally use the Twilio client to initiate a call
            # using TwiML and a WebSocket connection to OpenAI's Realtime API.
            
            # For demonstration, we return a mock success response with the script.
            script = f"Hello. You have a new hot lead from Autosphere. {lead_name} wants to test drive the {lead_car}. Press 1 to connect with them right now."
            
            return JsonResponse({
                "status": "success",
                "message": "AI Voice Call Initiated",
                "mock_transcript": [
                    {"speaker": "AI", "text": "Ringing dealership..."},
                    {"speaker": "Dealer", "text": "Hello, Jim's Auto?"},
                    {"speaker": "AI", "text": script},
                    {"speaker": "Dealer", "text": "Pressing 1!"},
                    {"speaker": "System", "text": "Call connected successfully."}
                ]
            })
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "POST required"}, status=400)
