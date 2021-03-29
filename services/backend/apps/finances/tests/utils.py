from urllib.parse import urlencode

from stripe.api_requestor import _api_encode


def stripe_encode(data):
    encoded_params = urlencode(list(_api_encode(data)))
    return encoded_params.replace("%5B", "[").replace("%5D", "]")
