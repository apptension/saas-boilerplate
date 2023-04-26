from django.conf import settings
from rest_framework import HTTP_HEADER_ENCODING
from rest_framework_simplejwt import authentication


class JSONWebTokenCookieAuthentication(authentication.JWTAuthentication):
    def get_header(self, request):
        """
        Extracts the header containing the JSON web token from the given
        request.
        """
        header = request.COOKIES.get(settings.ACCESS_TOKEN_COOKIE)

        if isinstance(header, str):
            # Work around django test client oddness
            header = header.encode(HTTP_HEADER_ENCODING)

        return header

    def get_raw_token(self, header):
        return header
