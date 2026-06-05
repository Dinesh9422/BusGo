from django.urls import path
from . import views

urlpatterns = [
    path('search/', views.SearchTripsView.as_view(), name='search_trips'),
    path('trips/<int:pk>/', views.TripDetailView.as_view(), name='trip_detail'),
    path('routes/', views.RouteListView.as_view(), name='routes'),
    path('popular-routes/', views.PopularRoutesView.as_view(), name='popular_routes'),
    # Admin
    path('admin/buses/', views.AdminBusListCreateView.as_view(), name='admin_buses'),
    path('admin/buses/<int:pk>/', views.AdminBusDetailView.as_view(), name='admin_bus_detail'),
    path('admin/schedules/', views.AdminScheduleListCreateView.as_view(), name='admin_schedules'),
    path('admin/trips/', views.AdminTripListCreateView.as_view(), name='admin_trips'),
    path('admin/routes/', views.AdminRouteListCreateView.as_view(), name='admin_routes'),
    path('admin/buses/<int:bus_id>/generate-seats/', views.GenerateSeatsView.as_view(), name='generate_seats'),
]
