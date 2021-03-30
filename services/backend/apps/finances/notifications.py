import logging

from common import emails
from . import email_serializers

logger = logging.getLogger(__name__)


class CustomerEmail(emails.Email):
    def __init__(self, customer, data=None):
        super().__init__(to=customer.subscriber.email, data=data)


class TrialExpiresSoonEmail(CustomerEmail):
    name = 'trialExpiresSoon'
    serializer_class = email_serializers.TrialExpiresSoonEmailSerializer


class SubscriptionErrorEmail(CustomerEmail):
    name = 'subscriptionError'
