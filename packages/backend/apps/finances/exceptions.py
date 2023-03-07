from common.exceptions import DomainException


class UserOrCustomerNotDefined(DomainException):
    pass


class SubscriptionAndPriceDefinedTogether(DomainException):
    pass


class SubscriptionOrPriceNotDefined(DomainException):
    pass
