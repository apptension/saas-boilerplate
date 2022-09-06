---
title: AWS X-Ray
---

Project is configured with a tracing solution called AWS X-Ray in backend and workers services.
It is useful for monitoring and debugging your application in hosted environments. You can access X-Ray by going to the CloudWatch console and the X-Ray traces section in the sidebar.
For the backend, it will let you look at each API request that took place, its outcome, how long it took and how long it spent in each of the involved AWS services.
For the workers, it will let you see each worker function invocation, and then its outcome, how long it took and how long it spent in each of the involved AWS services.

## Instrumenting backend functions

You can increase the granularity of X-Ray traces by instrumenting specific functions in the backend service. To do it, you need to decorate a function with an `xray_recorder.capture` decorator. It takes an argument which is the name of the trace that will appear in X-Ray.

```python
# apps/demo/views.py

from aws_xray_sdk.core import xray_recorder

class ContentfulDemoItemFavoriteListViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = (policies.IsAuthenticatedFullAccess,)
    serializer_class = serializers.ContentfulDemoItemFavoriteSerializer
    queryset = models.ContentfulDemoItemFavorite.objects.all()

    @xray_recorder.capture("ContentfulDemoItemFavoriteListViewSet_get-queryset")
    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
```

It can be any function in the backend service. For example, you can overwrite the default middleware and decorate its `process_request` and/or `process_response` functions with `xray_recorder`.

```python
# common/middleware.py

from django.middleware.security import SecurityMiddleware
from aws_xray_sdk.core import xray_recorder

class InstrumentedSecurityMiddleware(SecurityMiddleware):
    @xray_recorder.capture('SecurityMiddleware_process-request')
    def process_request(self, request):
        return super().process_request(request)

    @xray_recorder.capture('SecurityMiddleware_process_response')
    def process_response(self, request, response):
        return super().process_response(request, response)
```

```python
# config/settings.py

MIDDLEWARE = [
    "common.middleware.HealthCheckMiddleware",
    "aws_xray_sdk.ext.django.middleware.XRayMiddleware",
    "django_hosts.middleware.HostsRequestMiddleware",
    "common.middleware.InstrumentedSecurityMiddleware",
    ...
]
```
