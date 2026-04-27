from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from . import views

app_name = 'djangoapp'
urlpatterns = [
    # path for registration
    path(route='register', view=views.registration, name='register'),

    # path for login
    path(route='login', view=views.login_user, name='login'),
    path(route='logout', view=views.logout_request, name='logout'),
    path(route='get_cars', view=views.get_cars, name='getcars'),

    # path for dealer reviews view
    path(route='get_dealers', view=views.get_dealerships, name='get_dealers'),
    path(route='get_dealers/<str:state>', view=views.get_dealerships, name='get_dealers_by_state'),
    path(route='dealer/<int:dealer_id>', view=views.get_dealer_details_v2, name='dealer_details'),
    path(route='reviews/dealer/<int:dealer_id>', view=views.get_dealer_reviews, name='dealer_reviews'),
    path(route='inventory/<int:dealer_id>', view=views.get_inventory, name='get_inventory'),
    path(route='summarize', view=views.summarize_reviews_proxy, name='summarize_reviews'),

    # path for add a review view
    path(route='add_review', view=views.add_review, name='add_review'),

    # path for leaderboard
    path(route='leaderboard', view=views.get_leaderboard, name='leaderboard'),
    path(route='system-health', view=views.get_system_health, name='system_health'),
    path(route='book', view=views.book_appointment, name='book_appointment'),
    path(route='bookings/user/<str:username>', view=views.get_user_bookings, name='user_bookings'),
    path(route='dashboard-stats', view=views.get_dashboard_stats, name='dashboard_stats'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
