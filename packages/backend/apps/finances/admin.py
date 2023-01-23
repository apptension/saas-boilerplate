from django.contrib import admin

from djstripe import models as djstripe_models, admin as djstripe_admin

admin.site.unregister(djstripe_models.PaymentIntent)
admin.site.unregister(djstripe_models.Charge)


@admin.register(djstripe_models.PaymentIntent)
class PaymentIntentAdmin(djstripe_admin.PaymentIntentAdmin):
    change_form_template = 'djstripe/paymentintent/admin/change_form.html'


@admin.register(djstripe_models.Charge)
class ChargeAdmin(djstripe_admin.ChargeAdmin):
    change_form_template = 'djstripe/charge/admin/change_form.html'


@admin.register(djstripe_models.SubscriptionSchedule)
class SubscriptionScheduleAdmin(djstripe_admin.StripeModelAdmin):
    pass
