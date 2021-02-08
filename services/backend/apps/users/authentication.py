from rest_framework_jwt import authentication


class JSONWebTokenAuthentication(authentication.JSONWebTokenAuthentication):
    @classmethod
    def get_token_from_request(cls, request):
        return cls.get_token_from_cookies(request.COOKIES)
