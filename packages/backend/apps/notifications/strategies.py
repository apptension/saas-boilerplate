from . import models


class BaseNotificationStrategy:
    @staticmethod
    def should_send_notification(user: str, type: str):
        """
        Based on strategy, user and notification type decide, if notification should be sent to user.
        Can be used if application allows user to disable specific notification channels or user can customize what
        notification types he wants to receive.
        """
        return True

    @staticmethod
    def send_notification(user: str, type: str, data: dict):
        raise NotImplementedError("Subclasses of BaseNotificationStrategy must provide a send_notification() function")


class InAppNotificationStrategy(BaseNotificationStrategy):
    @staticmethod
    def send_notification(user: str, type: str, data: dict, issuer: str):
        models.Notification.objects.create(user=user, type=type, data=data, issuer=issuer)
