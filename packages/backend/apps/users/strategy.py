from config import settings
from social_django.strategy import DjangoStrategy

from . import utils


class DjangoJWTStrategy(DjangoStrategy):
    def __init__(self, storage, request=None, tpl=None):
        self.refresh_token = None
        self.otp_auth_token = None
        super(DjangoJWTStrategy, self).__init__(storage, request, tpl)

    def redirect(self, url):
        """
        This method is called multiple times by social_django in various situations.
        One of such cases is when the OAuth2 flow is complete and we redirect user
        back to the web app. In such case an HTTPOnly cookie should be set to a
        JWT created during this step.
        """
        response = super(DjangoJWTStrategy, self).redirect(url)

        if self._user_is_authenticated():
            if self.refresh_token:
                utils.set_auth_cookie(
                    response,
                    {
                        settings.ACCESS_TOKEN_COOKIE: str(self.refresh_token.access_token),
                        settings.REFRESH_TOKEN_COOKIE: str(self.refresh_token),
                    },
                )
            elif self.otp_auth_token:
                otp_validate_url = self._construct_otp_validate_url(url)
                response = super(DjangoJWTStrategy, self).redirect(otp_validate_url)
                response.set_cookie(
                    settings.OTP_AUTH_TOKEN_COOKIE, str(self.otp_auth_token), settings.COOKIE_MAX_AGE, httponly=True
                )

            # The token has a defined value, which means this is the
            # last step of the OAuth flow – we can flush the session
            self.session.flush()

        return response

    def set_jwt(self, token):
        self.refresh_token = token

    def set_otp_auth_token(self, token):
        self.otp_auth_token = token

    def _user_is_authenticated(self) -> bool:
        return self.refresh_token or self.otp_auth_token

    def _construct_otp_validate_url(self, url: str) -> str:
        locale = self.session_get('locale')
        return f"{url}/{locale}{settings.OTP_VALIDATE_PATH}"
