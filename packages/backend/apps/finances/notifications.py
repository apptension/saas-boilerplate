import logging

from common import emails
from . import email_serializers

logger = logging.getLogger(__name__)


class CustomerEmail(emails.Email):
    def __init__(self, customer, data=None):
        to = None
        if customer.subscriber:
            to = customer.subscriber.email
        super().__init__(to=to, data=data)


class TrialExpiresSoonEmail(CustomerEmail):
    name = 'TRIAL_EXPIRES_SOON'
    serializer_class = email_serializers.TrialExpiresSoonEmailSerializer


class SubscriptionErrorEmail(CustomerEmail):
    name = 'SUBSCRIPTION_ERROR'
