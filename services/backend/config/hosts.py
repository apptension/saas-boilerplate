from django_hosts import patterns, host
from django.conf import settings

host_patterns = patterns(
    "",
    host(r"admin", "config.urls_admin", name="admin"),
    host(r"api", settings.ROOT_URLCONF, name="api"),
)
