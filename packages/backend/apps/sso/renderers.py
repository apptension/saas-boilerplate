"""
SCIM-compliant renderers and parsers for Django REST Framework.

SCIM 2.0 (RFC 7644) specifies application/scim+json as the media type.
Okta and other IdPs send Accept: application/scim+json, which causes
406 Not Acceptable if the server only supports application/json.
"""

from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser


class SCIMRenderer(JSONRenderer):
    """
    JSON renderer that produces application/scim+json.

    Required for SCIM 2.0 compliance - IdP SCIM clients (Okta, etc.)
    send Accept: application/scim+json and expect this content type.
    """

    media_type = "application/scim+json"
    format = "scim"


class SCIMParser(JSONParser):
    """
    JSON parser that accepts application/scim+json request bodies.

    SCIM clients may send Content-Type: application/scim+json for
    POST/PUT/PATCH requests. This parser treats it as JSON.
    """

    media_type = "application/scim+json"
