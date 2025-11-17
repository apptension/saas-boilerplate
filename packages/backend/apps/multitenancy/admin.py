from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html

from . import models


@admin.register(models.Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "type")


@admin.register(models.TenantMembership)
class TenantMembershipAdmin(admin.ModelAdmin):
    list_display = ("id", "role", "user_display", "invitee_email_display", "tenant", "status_display", "created_at")
    list_filter = ("is_accepted", "role", "tenant__name", "created_at")
    search_fields = ("user__email", "invitee_email_address", "tenant__name")
    readonly_fields = ("created_at", "updated_at", "invitation_accepted_at")
    actions = ["accept_invitations"]

    def get_queryset(self, request):
        """
        Override the manager's get_queryset to show all memberships including pending invitations.
        This bypasses the TenantMembershipManager's filtering that only shows accepted memberships.
        """
        return models.TenantMembership.objects.get_all()

    def user_display(self, obj):
        """Display user information or indicate pending invitation"""
        if obj.user:
            return obj.user.email
        return "—"

    user_display.short_description = "User"

    def invitee_email_display(self, obj):
        """Display invitee email for invitations (pending or accepted)"""
        if obj.invitee_email_address:
            if not obj.is_accepted:
                return obj.invitee_email_address
            else:
                # Show historical data for accepted invitations
                return format_html('<span style="color: gray;">{} (accepted)</span>', obj.invitee_email_address)
        return "—"

    invitee_email_display.short_description = "Invitee Email"

    def status_display(self, obj):
        """Display invitation status with color coding"""
        if obj.is_accepted:
            return format_html('<span style="color: green;">✓ Accepted</span>')
        else:
            return format_html('<span style="color: orange;">⏳ Pending</span>')

    status_display.short_description = "Status"

    @admin.action(description="Accept selected invitations")
    def accept_invitations(self, request, queryset):
        """Accept pending invitations"""
        pending = queryset.filter(is_accepted=False)
        count = pending.update(is_accepted=True, invitation_accepted_at=timezone.now())
        self.message_user(request, f"Successfully accepted {count} invitation(s).")
