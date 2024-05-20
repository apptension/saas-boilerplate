from django.contrib import admin

from . import models


@admin.register(models.Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "type")


@admin.register(models.TenantMembership)
class TenantMembershipAdmin(admin.ModelAdmin):
    list_display = ("id", "role", "user", "invitee_email_address", "tenant", "is_accepted")
