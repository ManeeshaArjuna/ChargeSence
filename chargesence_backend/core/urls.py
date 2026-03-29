from django.urls import path

from core.views.booking_view import available_slots, pay_booking, user_bookings
from core.views.user_views import change_password, register_user, reset_password, update_user, verify_otp
from core.views.vehicle_views import create_vehicle, delete_vehicle, list_vehicles
from core.views.station_views import list_stations, station_chargers

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

from core.views.recommend import recommend_api

from core.views.booking_view import pay_booking

from core.views.booking_view import available_slots, pay_booking, create_booking

from core.views.booking_view import (
    available_slots,
    pay_booking,
    create_booking,
    complete_booking,
    cancel_booking
)

from core.views.user_views import request_otp, verify_otp, reset_password
from core.views.wallet_views import add_card, delete_card, get_cards, redeem_rewards



urlpatterns = [

    path('register/', register_user),

    path('vehicles/', create_vehicle),
    path('vehicles/list/', list_vehicles),

    path('stations/', list_stations),
    path('stations/<int:station_id>/chargers/', station_chargers),

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

    path('recommend/', recommend_api),

    path('available-slots/', available_slots),
    path('create-booking/', create_booking),
    path('pay-booking/', pay_booking),

    path('my-bookings/', user_bookings),

    path('complete-booking/', complete_booking),
    path('cancel-booking/', cancel_booking),

    path('user/update/', update_user),

    path('vehicles/<int:id>/', delete_vehicle),

    path('password/request-otp/', request_otp),
    path('password/verify-otp/', verify_otp),
    path('password/reset/', reset_password),

    path('cards/', get_cards),
    path('cards/add/', add_card),
    path('cards/<int:id>/', delete_card),

    path("redeem-rewards/", redeem_rewards),

]