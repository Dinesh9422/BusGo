from django.urls import path
from . import views

urlpatterns = [
    # Booking URLs
    path('create/', views.CreateBookingView.as_view(), name='create_booking'),
    path('my-bookings/', views.UserBookingsView.as_view(), name='user_bookings'),
    path('<int:pk>/', views.BookingDetailView.as_view(), name='booking_detail'),
    path('<int:pk>/cancel/', views.CancelBookingView.as_view(), name='cancel_booking'),
    path('<int:pk>/download-ticket/', views.DownloadTicketView.as_view(), name='download_ticket'),

    # Reviews
    path('reviews/add/', views.AddReviewView.as_view(), name='add_review'),
    path('reviews/bus/<int:bus_id>/', views.BusReviewsView.as_view(), name='bus_reviews'),

    # Promo Code
    path('promo/validate/', views.ValidatePromoView.as_view(), name='validate_promo'),

    # Loyalty Points
    path('loyalty/', views.LoyaltyPointsView.as_view(), name='loyalty_points'),

    # Notifications
    path('notifications/', views.NotificationListView.as_view(), name='notifications'),
    path('notifications/<int:pk>/read/', views.MarkNotificationReadView.as_view(), name='mark_notification_read'),

    # Admin
    path('admin/all/', views.AdminBookingListView.as_view(), name='admin_bookings'),
    path('admin/<int:pk>/', views.AdminBookingDetailView.as_view(), name='admin_booking_detail'),
]