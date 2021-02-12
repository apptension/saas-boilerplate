import contentful

import settings


def get_client():
    return contentful.Client(
        space_id=settings.CONTENTFUL_SPACE_ID,
        access_token=settings.CONTENTFUL_ACCESS_TOKEN,
        environment=settings.CONTENTFUL_ENVIRONMENT,
    )
