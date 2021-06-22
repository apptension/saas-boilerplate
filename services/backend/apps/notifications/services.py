from django.contrib.auth import get_user_model

from .models import Notification

User = get_user_model()


class NotificationService:
    @classmethod
    def mark_read_all_user_notifications(cls, user: User):
        Notification.objects.filter_by_user(user).filter_unread().mark_read()

    @classmethod
    def user_has_unread_notifications(cls, user: User):
        return Notification.objects.filter_by_user(user).filter_unread().exists()
