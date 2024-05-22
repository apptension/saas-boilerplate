from .models import Tenant


def create_default_tenant(user=None, is_new=False, *args, **kwargs):
    if user and is_new:
        Tenant.objects.get_or_create_user_default_tenant(user)
