import os
import stripe
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import DealershipBilling
import logging

logger = logging.getLogger(__name__)

stripe.api_key = os.getenv('STRIPE_SECRET_KEY', 'sk_test_dummy_key')

@csrf_exempt
def create_checkout_session(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Method not allowed"}, status=405)
        
    try:
        data = json.loads(request.body)
        dealer_id = data.get('dealer_id')
        credits_to_buy = data.get('credits', 10)
        
        # In a real app, this creates a Stripe Checkout Session
        # We will mock the success URL directly for demo purposes
        
        domain_url = (request.META.get('HTTP_ORIGIN') or os.getenv('FRONTEND_URL', 'http://localhost:3000')).rstrip('/')
        
        # MOCK STRIPE SESSION
        session_id = f"cs_test_{dealer_id}_{credits_to_buy}"
        
        # Auto-credit the dealer since we don't have real Stripe Webhooks setup in this sandbox
        billing, created = DealershipBilling.objects.get_or_create(dealer_id=dealer_id)
        billing.lead_credits += int(credits_to_buy)
        billing.save()
        
        return JsonResponse({
            "sessionId": session_id,
            "url": f"{domain_url}/dealer-leaderboard?payment_success=true&credits={credits_to_buy}"
        })
    except Exception as e:
        logger.error(f"Stripe session error: {e}")
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def stripe_webhook(request):
    # Endpoint for real Stripe webhooks
    return JsonResponse({"status": "success"})

def get_dealer_credits(request, dealer_id):
    try:
        billing = DealershipBilling.objects.filter(dealer_id=dealer_id).first()
        credits = billing.lead_credits if billing else 0
        is_sponsored = billing.is_sponsored if billing else False
        return JsonResponse({"dealer_id": dealer_id, "lead_credits": credits, "is_sponsored": is_sponsored})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def create_spotlight_session(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Method not allowed"}, status=405)
        
    try:
        data = json.loads(request.body)
        dealer_id = data.get('dealer_id')
        
        domain_url = (request.META.get('HTTP_ORIGIN') or os.getenv('FRONTEND_URL', 'http://localhost:3000')).rstrip('/')
        session_id = f"cs_test_spotlight_{dealer_id}"
        
        from django.utils import timezone
        from datetime import timedelta
        
        billing, created = DealershipBilling.objects.get_or_create(dealer_id=dealer_id)
        billing.is_sponsored = True
        billing.sponsor_expiry = timezone.now() + timedelta(days=30)
        billing.save()
        
        return JsonResponse({
            "sessionId": session_id,
            "url": f"{domain_url}/dealer-leaderboard?payment_success=true&spotlight=true"
        })
    except Exception as e:
        logger.error(f"Stripe spotlight session error: {e}")
        return JsonResponse({"error": str(e)}, status=500)
