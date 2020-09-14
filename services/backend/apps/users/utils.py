from django.conf import settings
from django.utils import module_loading


user_notification_impl = module_loading.import_string(getattr(settings, "USER_NOTIFICATION_IMPL"))
