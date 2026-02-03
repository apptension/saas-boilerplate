import logging

from common import emails
from apps.users.notifications import get_user_language
from . import email_serializers

logger = logging.getLogger(__name__)


class CustomerEmail(emails.Email):
    def __init__(self, customer, data=None):
        to = None
        lang = emails.DEFAULT_EMAIL_LANGUAGE
        if customer.subscriber:
            to = customer.subscriber.email
            lang = get_user_language(customer.subscriber)
        super().__init__(to=to, data=data, lang=lang)


class TrialExpiresSoonEmail(CustomerEmail):
    name = "TRIAL_EXPIRES_SOON"
    serializer_class = email_serializers.TrialExpiresSoonEmailSerializer


class SubscriptionErrorEmail(CustomerEmail):
    name = "SUBSCRIPTION_ERROR"
