from django.contrib import admin

from . import models


@admin.register(models.WebSocketConnection)
class WebSocketConnectionAdmin(admin.ModelAdmin):
    pass


@admin.register(models.GraphQLSubscription)
class GraphQLSubscriptionAdmin(admin.ModelAdmin):
    pass
