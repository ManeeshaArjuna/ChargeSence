from django.contrib import admin
from .models import *
from .models import ChargingQueue


admin.site.register(User)
admin.site.register(Vehicle)
admin.site.register(ChargingStation)
admin.site.register(Charger)
admin.site.register(Wallet)
admin.site.register(WalletTransaction)
admin.site.register(Booking)
admin.site.register(ChargingQueue)