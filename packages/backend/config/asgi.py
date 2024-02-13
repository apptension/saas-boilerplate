"""
ASGI config for project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.0/howto/deployment/asgi/
"""

import os

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from django.urls import path

from apps.users.authentication import JSONWebTokenCookieMiddleware
from apps.websockets.consumers import DefaultGraphqlWsConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": JSONWebTokenCookieMiddleware(
            URLRouter(
                [
                    path("api/graphql/", DefaultGraphqlWsConsumer.as_asgi()),
                ]
            )
        ),
    }
)
