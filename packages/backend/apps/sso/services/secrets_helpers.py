"""
SSO-specific convenience functions for secrets management.

These are thin wrappers around the shared SecretsService that provide
SSO-specific convenience methods.
"""

import json
from typing import Optional, Dict

from common.secrets.service import get_secrets_service

logger = None  # Will be set if needed


def store_saml_certificate(
    tenant_id: str,
    connection_id: str,
    certificate: str,
) -> Optional[str]:
    """
    Store a SAML IdP certificate.
    
    Args:
        tenant_id: The tenant identifier
        connection_id: The SSO connection identifier
        certificate: The certificate value
    
    Returns:
        The ARN of the stored secret, or None if unavailable
    """
    secrets_service = get_secrets_service('sso')
    return secrets_service.store_secret(
        tenant_id=tenant_id,
        secret_type=f"saml_certificate_{connection_id}",
        secret_value=certificate,
        description=f"SAML IdP certificate for SSO connection {connection_id}",
    )


def store_sp_signing_key(
    tenant_id: str,
    connection_id: str,
    private_key: str,
    certificate: str,
) -> Optional[str]:
    """
    Store SP signing key pair (private key + certificate).
    
    Args:
        tenant_id: The tenant identifier
        connection_id: The SSO connection identifier
        private_key: The private key value
        certificate: The certificate value
    
    Returns:
        The ARN of the stored secret, or None if unavailable
    """
    secrets_service = get_secrets_service('sso')
    key_pair = json.dumps(
        {
            'private_key': private_key,
            'certificate': certificate,
        }
    )
    return secrets_service.store_secret(
        tenant_id=tenant_id,
        secret_type=f"sp_signing_key_{connection_id}",
        secret_value=key_pair,
        description=f"SP signing key pair for SSO connection {connection_id}",
    )


def get_sp_signing_key(secret_arn: str) -> Optional[Dict[str, str]]:
    """
    Get SP signing key pair.
    
    Args:
        secret_arn: The ARN of the secret
    
    Returns:
        Dictionary with 'private_key' and 'certificate' keys, or None if not found
    """
    secrets_service = get_secrets_service('sso')
    secret = secrets_service.get_secret(secret_arn)
    if secret:
        return json.loads(secret)
    return None


def store_oidc_client_secret(
    tenant_id: str,
    connection_id: str,
    client_secret: str,
) -> Optional[str]:
    """
    Store an OIDC client secret.
    
    Args:
        tenant_id: The tenant identifier
        connection_id: The SSO connection identifier
        client_secret: The client secret value
    
    Returns:
        The ARN of the stored secret, or None if unavailable
    """
    secrets_service = get_secrets_service('sso')
    return secrets_service.store_secret(
        tenant_id=tenant_id,
        secret_type=f"oidc_client_secret_{connection_id}",
        secret_value=client_secret,
        description=f"OIDC client secret for SSO connection {connection_id}",
    )
