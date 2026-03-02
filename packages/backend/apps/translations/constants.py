"""
Constants for the translations app.
"""

# S3 paths
TRANSLATIONS_S3_PREFIX = "translations"

# Cache settings
TRANSLATIONS_CACHE_TTL = 3600  # 1 hour in seconds

# Sync settings
MAX_KEY_LENGTH = 512
MAX_DEFAULT_MESSAGE_LENGTH = 10000

# Default locales to create on first migration
DEFAULT_LOCALES = [
    {
        "code": "en",
        "name": "English",
        "native_name": "English",
        "is_default": True,
        "is_active": True,
        "sort_order": 0,
    },
    {
        "code": "pl",
        "name": "Polish",
        "native_name": "Polski",
        "is_default": False,
        "is_active": True,
        "sort_order": 1,
    },
]
