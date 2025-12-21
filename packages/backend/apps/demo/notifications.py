from graphql_relay import to_global_id

from apps.notifications import sender
from . import constants
from . import models


def send_new_entry_created_notification(entry: models.CrudDemoItem):
    tenant = entry.tenant
    for owner in tenant.owners:
        sender.send_notification(
            user=owner,
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
    tenant = entry.tenant
    users_to_be_notified = set(tenant.owners) | {entry.created_by}
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
