"""
DRF Versioned API URLs — /api/v1/

All endpoints return structured JSON and are documented via OpenAPI.
"""

from django.urls import path
from djangoapp import views

urlpatterns = [
    # ── Dealers ────────────────────────────────────────────
    path('dealers/', views.get_dealerships, name='api_dealers'),
    path('dealers/<str:state>/', views.get_dealerships, name='api_dealers_by_state'),
    path('dealer/<int:dealer_id>/', views.get_dealer_details_v2, name='api_dealer_detail'),

    # ── Reviews ────────────────────────────────────────────
    path('reviews/dealer/<int:dealer_id>/', views.get_dealer_reviews, name='api_dealer_reviews'),
    path('reviews/add/', views.add_review, name='api_add_review'),
    path('reviews/summarize/', views.summarize_reviews_proxy, name='api_summarize_reviews'),

    # ── Inventory ──────────────────────────────────────────
    path('inventory/<int:dealer_id>/', views.get_inventory, name='api_inventory'),

    # ── Auth ───────────────────────────────────────────────
    path('auth/login/', views.login_user, name='api_login'),
    path('auth/logout/', views.logout_request, name='api_logout'),
    path('auth/register/', views.registration, name='api_register'),

    # ── Car models ─────────────────────────────────────────
    path('cars/', views.get_cars, name='api_cars'),

    # ── Leaderboard ────────────────────────────────────────
    path('leaderboard/', views.get_leaderboard, name='api_leaderboard'),

    # ── Booking ────────────────────────────────────────────
    path('book/', views.book_appointment, name='api_book_appointment'),
    path('bookings/user/<str:username>/', views.get_user_bookings, name='api_user_bookings'),

    # ── Analytics & Health ─────────────────────────────────
    path('system-health/', views.get_system_health, name='api_system_health'),
    path('dashboard-stats/', views.get_dashboard_stats, name='api_dashboard_stats'),
]
