from django.contrib import admin, messages
from django.core.management import call_command

from djstripe import models as djstripe_models, admin as djstripe_admin

admin.site.unregister(djstripe_models.PaymentIntent)
admin.site.unregister(djstripe_models.Charge)
admin.site.unregister(djstripe_models.Product)
admin.site.unregister(djstripe_models.Price)


@admin.register(djstripe_models.PaymentIntent)
class PaymentIntentAdmin(djstripe_admin.StripeModelAdmin):
    change_form_template = "djstripe/paymentintent/admin/change_form.html"


@admin.register(djstripe_models.Charge)
class ChargeAdmin(djstripe_admin.StripeModelAdmin):
    change_form_template = "djstripe/charge/admin/change_form.html"


@admin.action(description="Sync all products and prices from Stripe")
def sync_stripe_products(modeladmin, request, queryset):
    """Sync Product and Price models from Stripe."""
    try:
        call_command("djstripe_sync_models", "Product", "Price")
        messages.success(request, "Successfully synced products and prices from Stripe.")
    except Exception as e:
        messages.error(request, f"Sync failed: {str(e)}")


@admin.register(djstripe_models.Product)
class ProductAdmin(djstripe_admin.StripeModelAdmin):
    actions = [sync_stripe_products]
    list_display = ("id", "name", "active", "created", "livemode")
    list_filter = ("active", "livemode", "created")
    search_fields = ("id", "name", "description")


@admin.register(djstripe_models.Price)
class PriceAdmin(djstripe_admin.StripeModelAdmin):
    actions = [sync_stripe_products]
    list_display = ("id", "product", "unit_amount", "currency", "active", "recurring", "livemode")
    list_filter = ("active", "livemode", "currency", "type")
    search_fields = ("id", "nickname", "product__name")
