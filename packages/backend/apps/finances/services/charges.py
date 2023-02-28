from djstripe.enums import RefundStatus

from djstripe.models import Refund


def fail_charge_refund(refund: Refund, reason: str):
    refund.failure_reason = reason
    refund.status = RefundStatus.failed
    refund.save()
