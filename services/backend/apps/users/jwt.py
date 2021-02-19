from rest_framework_simplejwt.token_blacklist import models as blacklist_models


def blacklist_user_tokens(user):
    tokens = blacklist_models.OutstandingToken.objects.filter(user=user)
    for token in tokens:
        blacklist_models.BlacklistedToken.objects.get_or_create(token=token)
