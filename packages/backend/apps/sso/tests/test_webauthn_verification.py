"""
Tests for the cryptographic part of the passkey flows.

These build real WebAuthn assertions and attestations with locally generated
keys, so the signature check runs for real instead of being mocked.
"""

import base64
import hashlib
import json
import secrets

import cbor2
import pytest
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec, padding, rsa
from django.core.cache import cache
from django.test import override_settings

from apps.sso import models
from apps.sso.services.webauthn import WebAuthnService
from apps.sso.tests.factories import UserPasskeyFactory
from apps.users.tests.factories import UserFactory

pytestmark = pytest.mark.django_db

ORIGIN = "https://app.example.com"
RP_ID = "app.example.com"

OPTIONS_URL = "/api/sso/passkeys/authenticate/options"
VERIFY_URL = "/api/sso/passkeys/authenticate/verify"

FLAG_USER_PRESENT = 0x01
FLAG_USER_VERIFIED = 0x04
FLAG_ATTESTED_CREDENTIAL = 0x40


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def int_bytes(value: int, length: int = None) -> bytes:
    return value.to_bytes(length or (value.bit_length() + 7) // 8, "big")


def spki(private_key) -> bytes:
    """What the browser's `getPublicKey()` returns, and what the webapp has been storing."""
    return private_key.public_key().public_bytes(
        serialization.Encoding.DER, serialization.PublicFormat.SubjectPublicKeyInfo
    )


def cose(private_key) -> bytes:
    """The credential public key as the authenticator encodes it in attested credential data."""
    numbers = private_key.public_key().public_numbers()
    if isinstance(private_key, rsa.RSAPrivateKey):
        return cbor2.dumps({1: 3, 3: -257, -1: int_bytes(numbers.n), -2: int_bytes(numbers.e)})
    return cbor2.dumps({1: 2, 3: -7, -1: 1, -2: int_bytes(numbers.x, 32), -3: int_bytes(numbers.y, 32)})


def sign(private_key, data: bytes) -> bytes:
    if isinstance(private_key, rsa.RSAPrivateKey):
        return private_key.sign(data, padding.PKCS1v15(), hashes.SHA256())
    return private_key.sign(data, ec.ECDSA(hashes.SHA256()))


def authenticator_data(sign_count: int = 1, flags: int = FLAG_USER_PRESENT | FLAG_USER_VERIFIED, rp_id: str = RP_ID):
    return hashlib.sha256(rp_id.encode()).digest() + bytes([flags]) + sign_count.to_bytes(4, "big")


def client_data(challenge: str, ceremony: str = "webauthn.get", origin: str = ORIGIN) -> bytes:
    return json.dumps({"type": ceremony, "challenge": challenge, "origin": origin}).encode()


def assertion(private_key, passkey, challenge: str, auth_data: bytes = None, signature: bytes = None) -> dict:
    """Keyword arguments for `WebAuthnService.verify_authentication`."""
    auth_data = auth_data if auth_data is not None else authenticator_data()
    client_data_bytes = client_data(challenge)
    if signature is None:
        signature = sign(private_key, auth_data + hashlib.sha256(client_data_bytes).digest())
    return {
        "challenge": challenge,
        "credential_id": passkey.credential_id,
        "authenticator_data": b64url(auth_data),
        "client_data_json": b64url(client_data_bytes),
        "signature": b64url(signature),
    }


def as_request_body(kwargs: dict) -> dict:
    return {
        "challenge": kwargs["challenge"],
        "credentialId": kwargs["credential_id"],
        "authenticatorData": kwargs["authenticator_data"],
        "clientDataJSON": kwargs["client_data_json"],
        "signature": kwargs["signature"],
    }


@pytest.fixture(autouse=True)
def webauthn_settings():
    cache.clear()  # the passkey endpoints are throttled per IP
    with override_settings(WEB_APP_URL=ORIGIN):
        yield


@pytest.fixture
def ec_key():
    return ec.generate_private_key(ec.SECP256R1())


@pytest.fixture
def user():
    return UserFactory()


@pytest.fixture
def passkey(user, ec_key):
    return UserPasskeyFactory(user=user, public_key=b64url(spki(ec_key)))


def auth_challenge(user=None) -> str:
    return models.WebAuthnChallenge.create_challenge(user=user, challenge_type="authentication").challenge


class TestPasskeyLoginEndpoints:
    def test_forged_signature_does_not_log_in(self, api_client, user, passkey):
        """Knowing a user's email must not be enough to obtain their session."""
        options = api_client.post(OPTIONS_URL, {"email": user.email}, format="json").json()
        credential_id = options["allowCredentials"][0]["id"]
        assert credential_id == passkey.credential_id

        response = api_client.post(
            VERIFY_URL,
            {
                "challenge": options["challenge"],
                "credentialId": credential_id,
                "authenticatorData": b64url(authenticator_data()),
                "clientDataJSON": b64url(client_data(options["challenge"])),
                "signature": b64url(secrets.token_bytes(70)),
            },
            format="json",
        )

        assert response.status_code == 400
        assert "access" not in response.json()
        assert not response.cookies

    def test_genuine_assertion_logs_in(self, api_client, user, passkey, ec_key):
        options = api_client.post(OPTIONS_URL, {"email": user.email}, format="json").json()

        response = api_client.post(
            VERIFY_URL, as_request_body(assertion(ec_key, passkey, options["challenge"])), format="json"
        )

        assert response.status_code == 200
        assert response.json()["access"]


class TestSignatureVerification:
    def test_accepts_key_stored_as_spki(self, user, passkey, ec_key):
        """Passkeys registered before this fix hold the browser's SPKI key and must keep working."""
        verified_user, _ = WebAuthnService().verify_authentication(**assertion(ec_key, passkey, auth_challenge(user)))

        assert verified_user == user

    def test_accepts_key_stored_as_cose(self, user, ec_key):
        passkey = UserPasskeyFactory(user=user, public_key=b64url(cose(ec_key)))

        verified_user, _ = WebAuthnService().verify_authentication(**assertion(ec_key, passkey, auth_challenge(user)))

        assert verified_user == user

    @pytest.mark.parametrize("encode", [spki, cose])
    def test_accepts_rs256_key(self, user, encode):
        """RS256 is offered at registration (and used by Windows Hello), so it has to verify."""
        rsa_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        passkey = UserPasskeyFactory(user=user, public_key=b64url(encode(rsa_key)))

        verified_user, _ = WebAuthnService().verify_authentication(**assertion(rsa_key, passkey, auth_challenge(user)))

        assert verified_user == user

    def test_rejects_signature_from_another_key(self, user, passkey):
        other_key = ec.generate_private_key(ec.SECP256R1())

        with pytest.raises(ValueError, match="signature verification failed"):
            WebAuthnService().verify_authentication(**assertion(other_key, passkey, auth_challenge(user)))

    def test_rejects_passkey_without_usable_public_key(self, user, ec_key):
        passkey = UserPasskeyFactory(user=user, public_key="")

        with pytest.raises(ValueError, match="signature verification failed"):
            WebAuthnService().verify_authentication(**assertion(ec_key, passkey, auth_challenge(user)))

    def test_skip_setting_no_longer_disables_verification(self, user, passkey):
        """A leftover WEBAUTHN_SKIP_SIGNATURE_VERIFICATION=True in a deployment must have no effect."""
        with override_settings(WEBAUTHN_SKIP_SIGNATURE_VERIFICATION=True):
            with pytest.raises(ValueError):
                WebAuthnService().verify_authentication(
                    **assertion(None, passkey, auth_challenge(user), signature=secrets.token_bytes(70))
                )


class TestAssertionBinding:
    def test_rejects_challenge_issued_for_another_user(self, passkey, ec_key):
        someone_else = UserFactory()

        with pytest.raises(ValueError, match="Challenge"):
            WebAuthnService().verify_authentication(**assertion(ec_key, passkey, auth_challenge(someone_else)))

    def test_accepts_challenge_issued_without_a_user(self, user, passkey, ec_key):
        """Discoverable-credential login asks for a challenge before the user is known."""
        verified_user, _ = WebAuthnService().verify_authentication(**assertion(ec_key, passkey, auth_challenge(None)))

        assert verified_user == user

    def test_challenge_cannot_be_reused(self, user, passkey, ec_key):
        kwargs = assertion(ec_key, passkey, auth_challenge(user))
        WebAuthnService().verify_authentication(**kwargs)

        with pytest.raises(ValueError, match="Challenge"):
            WebAuthnService().verify_authentication(**kwargs)

    def test_failed_attempt_consumes_challenge(self, user, passkey, ec_key):
        challenge = auth_challenge(user)
        with pytest.raises(ValueError):
            WebAuthnService().verify_authentication(
                **assertion(ec_key, passkey, challenge, signature=secrets.token_bytes(70))
            )

        with pytest.raises(ValueError, match="Challenge"):
            WebAuthnService().verify_authentication(**assertion(ec_key, passkey, challenge))

    def test_rejects_assertion_for_another_relying_party(self, user, passkey, ec_key):
        auth_data = authenticator_data(rp_id="evil.example.com")

        with pytest.raises(ValueError, match="[Rr]elying party"):
            WebAuthnService().verify_authentication(
                **assertion(ec_key, passkey, auth_challenge(user), auth_data=auth_data)
            )

    def test_rejects_assertion_without_user_presence(self, user, passkey, ec_key):
        auth_data = authenticator_data(flags=0)

        with pytest.raises(ValueError, match="[Uu]ser presence"):
            WebAuthnService().verify_authentication(
                **assertion(ec_key, passkey, auth_challenge(user), auth_data=auth_data)
            )

    def test_rejects_truncated_authenticator_data(self, user, passkey, ec_key):
        with pytest.raises(ValueError, match="authenticator data"):
            WebAuthnService().verify_authentication(
                **assertion(ec_key, passkey, auth_challenge(user), auth_data=b"\x00" * 10)
            )

    def test_sign_count_regression_is_rejected_by_default(self, user, ec_key):
        passkey = UserPasskeyFactory(user=user, public_key=b64url(spki(ec_key)), sign_count=10)
        auth_data = authenticator_data(sign_count=5)

        with pytest.raises(ValueError, match="security anomaly"):
            WebAuthnService().verify_authentication(
                **assertion(ec_key, passkey, auth_challenge(user), auth_data=auth_data)
            )

        passkey.refresh_from_db()
        assert passkey.is_active is False


class TestRegistration:
    def register(self, user, key, rp_id: str = RP_ID, **overrides):
        credential_id = secrets.token_bytes(32)
        challenge = models.WebAuthnChallenge.create_challenge(user=user, challenge_type="registration").challenge
        auth_data = (
            authenticator_data(sign_count=0, flags=FLAG_USER_PRESENT | FLAG_ATTESTED_CREDENTIAL, rp_id=rp_id)
            + bytes(16)
            + len(credential_id).to_bytes(2, "big")
            + credential_id
            + cose(key)
        )
        kwargs = {
            "challenge": challenge,
            "credential_id": b64url(credential_id),
            "public_key": b64url(spki(key)),
            "attestation_object": b64url(cbor2.dumps({"fmt": "none", "attStmt": {}, "authData": auth_data})),
            "client_data_json": b64url(client_data(challenge, ceremony="webauthn.create")),
        }
        kwargs.update(overrides)
        return WebAuthnService(user).verify_registration(**kwargs)

    def test_registered_passkey_can_authenticate(self, user, ec_key):
        passkey = self.register(user, ec_key)

        verified_user, _ = WebAuthnService().verify_authentication(**assertion(ec_key, passkey, auth_challenge(user)))

        assert verified_user == user

    def test_stores_attested_key_not_the_client_supplied_one(self, user, ec_key):
        """Browsers without `getPublicKey()` send an empty key; the attestation is the source of truth."""
        passkey = self.register(user, ec_key, public_key="")

        assert passkey.public_key == b64url(cose(ec_key))

    def test_rejects_credential_id_not_matching_attestation(self, user, ec_key):
        with pytest.raises(ValueError, match="[Cc]redential"):
            self.register(user, ec_key, credential_id=b64url(b"not-the-attested-id"))

    def test_rejects_attestation_for_another_relying_party(self, user, ec_key):
        with pytest.raises(ValueError, match="[Rr]elying party"):
            self.register(user, ec_key, rp_id="evil.example.com")
