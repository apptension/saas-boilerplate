from django.db import models
from django.utils import timezone


class NotificationQuerySet(models.QuerySet):
    def filter_by_user(self, user):
        return self.filter(user=user)

    def filter_unread(self):
        return self.filter(read_at__isnull=True)

    def mark_read(self):
        self.update(read_at=timezone.now())


NotificationManager = models.Manager.from_queryset(NotificationQuerySet)
