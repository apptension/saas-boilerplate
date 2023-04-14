from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """
    A custom header that adds is_error field to a response.
    This field is helpful for the web app written in typescript which
    can conditionally define a response body type based on this flag.
    """
    if isinstance(exc, APIException):
        exc.detail = exc.get_full_details()

    response = exception_handler(exc, context)

    if response is not None:
        response.data['is_error'] = True

    return response


def get_client_ip(request):
    """Retrieve client ip from x-forwarded-for header in case of load balancer usage"""
    if x_forwarded_for := request.META.get('x-forwarded-for'):
        return x_forwarded_for.split(',')[0]

    return request.META['REMOTE_ADDR']
