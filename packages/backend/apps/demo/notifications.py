from django.contrib.auth import get_user_model
from graphql_relay import to_global_id

from apps.notifications import sender
from . import constants
from . import models


def send_new_entry_created_notification(entry: models.CrudDemoItem):
    User = get_user_model()
    for admin in User.objects.filter_admins():
        sender.send_notification(
            user=admin,
            type=constants.Notification.CRUD_ITEM_CREATED.value,
            data={
                "id": to_global_id('CrudDemoItemType', str(entry.id)),
                "name": entry.name,
            },
            issuer=entry.created_by,
        )


def send_entry_updated_notification(entry: models.CrudDemoItem):
    if not entry.edited_by:
        return
    User = get_user_model()
    users_to_be_notified = set(User.objects.filter_admins()) | {entry.created_by}
    for user in users_to_be_notified:
        if user and user != entry.edited_by:
            sender.send_notification(
                user=user,
                type=constants.Notification.CRUD_ITEM_UPDATED.value,
                data={
                    "id": to_global_id('CrudDemoItemType', str(entry.id)),
                    "name": entry.name,
                },
                issuer=entry.edited_by,
            )
