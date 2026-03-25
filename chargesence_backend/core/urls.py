from django.urls import path

from core.views.user_views import change_password, register_user
from core.views.vehicle_views import create_vehicle, list_vehicles
from core.views.station_views import list_stations, station_chargers
from core.views.booking_views import create_booking, list_bookings, cancel_booking

from core.views.charger_views import estimate_charging_cost

from core.views.recommendation_views import recommend_best_charger

from core.views.queue_views import join_queue

from core.views.admin_views import admin_dashboard

from core.views.home import home_dashboard

from core.views.chargers import all_chargers

from core.views.wallet import wallet_dashboard, topup_wallet

from core.views.route import route_chargers

from core.views.vehicle_views import user_vehicles

from core.views.user_views import user_profile



urlpatterns = [

    path('register/', register_user),

    path('vehicles/', create_vehicle),
    path('vehicles/list/', list_vehicles),

    path('stations/', list_stations),
    path('stations/<int:station_id>/chargers/', station_chargers),

    path('bookings/', create_booking),
    path('bookings/list/', list_bookings),
    path('bookings/<int:booking_id>/cancel/', cancel_booking),

    path('chargers/<int:charger_id>/estimate-cost/', estimate_charging_cost),

    path('recommend-charger/<int:vehicle_id>/', recommend_best_charger),

    path('queue/join/', join_queue),

    path('admin/dashboard/', admin_dashboard),

    path("home/", home_dashboard),

    path('chargers/', all_chargers),

    path('wallet/', wallet_dashboard),
    path('wallet/topup/', topup_wallet),

    path('route-chargers/', route_chargers),

    path('vehicles/', user_vehicles),

    path('user/profile/', user_profile),

    path('user/change-password/', change_password),

    

]