from rest_framework_jwt import utils


def encode_handler(payload):
    payload["user_id"] = str(payload["user_id"])
    return utils.jwt_encode_payload(payload)
