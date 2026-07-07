from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from . import views
from . import stripe_views
from . import ai_views

app_name = 'djangoapp'
urlpatterns = [
    # ── Authentication ─────────────────────────────────────
    path(route='register', view=views.registration, name='register'),
    path(route='login', view=views.login_user, name='login'),
    path(route='logout', view=views.logout_request, name='logout'),

    # ── Car models ─────────────────────────────────────────
    path(route='get_cars', view=views.get_cars, name='getcars'),

    # ── Dealers ────────────────────────────────────────────
    path(route='get_dealers', view=views.get_dealerships, name='get_dealers'),
    path(route='get_dealers/<str:state>', view=views.get_dealerships, name='get_dealers_by_state'),
    path(route='dealer/<int:dealer_id>', view=views.get_dealer_details_v2, name='dealer_details'),

    # ── Reviews ────────────────────────────────────────────
    path(route='reviews/dealer/<int:dealer_id>', view=views.get_dealer_reviews, name='dealer_reviews'),
    path(route='add_review', view=views.add_review, name='add_review'),
    path(route='summarize', view=views.summarize_reviews_proxy, name='summarize_reviews'),

    # ── Inventory ──────────────────────────────────────────
    path(route='inventory/<int:dealer_id>', view=views.get_inventory, name='get_inventory'),

    # ── Analytics ──────────────────────────────────────────
    path(route='leaderboard', view=views.get_leaderboard, name='leaderboard'),
    path(route='dashboard-stats', view=views.get_dashboard_stats, name='dashboard_stats'),

    # ── Health ─────────────────────────────────────────────
    path(route='system-health', view=views.get_system_health, name='system_health'),

    # ── Booking ────────────────────────────────────────────
    path(route='book', view=views.book_appointment, name='book_appointment'),
    path(route='bookings/user/<str:username>', view=views.get_user_bookings, name='user_bookings'),
    
    # ── SEO ────────────────────────────────────────────────
    path(route='sitemap.xml', view=views.sitemap_xml, name='sitemap_xml'),
    
    # Stripe integration
    path('stripe/create-checkout-session', stripe_views.create_checkout_session, name='stripe_checkout'),
    path('stripe/create-spotlight-session', stripe_views.create_spotlight_session, name='stripe_spotlight_checkout'),
    path('stripe/webhook', stripe_views.stripe_webhook, name='stripe_webhook'),
    path('dealer/<int:dealer_id>/credits', stripe_views.get_dealer_credits, name='get_dealer_credits'),

    # Trade-In Valuation
    path('leads/trade-in', views.trade_in_valuation, name='trade_in_valuation'),

    # Blockchain Ledger
    path('ledger/<str:vin>', views.get_vehicle_ledger, name='vehicle_ledger'),

    # Voice AI trigger
    path('voice/trigger-call/<int:dealer_id>', views.trigger_voice_call, name='trigger_voice_call'),

    # AI Studio
    path('generate_enhanced_prompt', ai_views.generate_enhanced_prompt, name='generate_enhanced_prompt'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
