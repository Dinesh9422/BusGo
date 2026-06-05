from django.urls import path
from . import views

urlpatterns = [
    path('initiate/', views.InitiatePaymentView.as_view(), name='initiate_payment'),
    path('<int:pk>/', views.PaymentDetailView.as_view(), name='payment_detail'),
    path('history/', views.UserPaymentHistoryView.as_view(), name='payment_history'),
    path('admin/all/', views.AdminPaymentListView.as_view(), name='admin_payments'),
]
