from django.urls import path

from core.views.booking_view import available_slots, pay_booking, user_bookings
from core.views.settings import get_settings, save_settings
from core.views.user_views import CustomLoginView, change_password, register_user, reset_password, update_profile,  verify_otp
from core.views.vehicle_views import create_vehicle, delete_vehicle, list_vehicles
from core.views.station_views import list_stations, station_chargers

from core.views.charger_views import estimate_charging_cost

from core.views.recommendation_views import recommend_best_charger

from core.views.queue_views import join_queue

from core.views.admin_views import  admin_reset_password, admin_send_otp, admin_stats, admin_verify_otp, create_charger, create_station, delete_charger, delete_station, get_bookings, get_chargers, get_stations, get_vehicles, send_notifications, update_booking_status, update_charger, update_station, update_vehicle

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

from core.views.user_views import CustomLoginView

from core.views.admin_views import get_users, create_user, update_user, delete_user



urlpatterns = [

    path('register/', register_user),

    path('vehicles/', create_vehicle),
    path('vehicles/list/', list_vehicles),

    path('stations/', list_stations),
    path('stations/<int:station_id>/chargers/', station_chargers),

    path('chargers/<int:charger_id>/estimate-cost/', estimate_charging_cost),

    path('recommend-charger/<int:vehicle_id>/', recommend_best_charger),

    path('queue/join/', join_queue),

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

    path('user/update/', update_profile),

    path('vehicles/<int:id>/', delete_vehicle),

    path('password/request-otp/', request_otp),
    path('password/verify-otp/', verify_otp),
    path('password/reset/', reset_password),

    path('cards/', get_cards),
    path('cards/add/', add_card),
    path('cards/<int:id>/', delete_card),

    path("redeem-rewards/", redeem_rewards),

    path("login/", CustomLoginView.as_view()),

    path("admin/stats/", admin_stats),

    path("admin/users/", get_users),
    path("admin/users/create/", create_user),
    path("admin/users/<int:id>/", update_user),
    path("admin/users/<int:id>/delete/", delete_user),

    path("admin/password/send-otp/", admin_send_otp),
    path("admin/password/verify-otp/", admin_verify_otp),
    path("admin/password/reset/", admin_reset_password),

    path("admin/stations/", get_stations),
    path("admin/stations/create/", create_station),
    path("admin/stations/<int:id>/", update_station),
    path("admin/stations/<int:id>/delete/", delete_station),

    path("admin/chargers/", get_chargers),
    path("admin/chargers/create/", create_charger),
    path("admin/chargers/<int:id>/", update_charger),
    path("admin/chargers/<int:id>/delete/", delete_charger),

    path("admin/bookings/", get_bookings),
    path("admin/bookings/<int:id>/", update_booking_status),

    path("admin/vehicles/", get_vehicles),
    path("admin/vehicles/create/", create_vehicle),
    path("admin/vehicles/<int:id>/", update_vehicle),
    path("admin/vehicles/<int:id>/delete/", delete_vehicle),

    path("admin/notifications/send/", send_notifications),

    path("settings/", save_settings),
    path("settings/get/", get_settings),

]