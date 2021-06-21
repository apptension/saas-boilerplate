from django.db import models


class NotificationQuerySet(models.QuerySet):
    def filter_by_user(self, user):
        return self.filter(user=user)


NotificationManager = models.Manager.from_queryset(NotificationQuerySet)
