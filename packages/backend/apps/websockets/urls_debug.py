from django.urls import path

from . import views

urlpatterns = [
    path("connect/", views.DebugConnectionCreateView.as_view(), name="websocket_debug_connect"),
    path(
        "disconnect/<connection_id>/", views.DebugDisconnectionCreateView.as_view(), name="websocket_debug_disconnect"
    ),
    path("message/<connection_id>/", views.DebugMessageView.as_view(), name="websocket_debug_message"),
]
