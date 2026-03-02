"""
AWS Secrets Manager integration for storing secrets securely.

This is a shared service that can be used by any module (SSO, backup, etc.)
to store and retrieve secrets from AWS Secrets Manager.
"""

import json
import logging
from typing import Dict, Optional

import boto3
from botocore.exceptions import ClientError
from django.conf import settings

logger = logging.getLogger(__name__)


class SecretsService:
    """
    Service for managing secrets in AWS Secrets Manager.

    This is a generic service that can be used by any module. Each instance
    is configured with a prefix (e.g., 'sso', 'backup') to organize secrets
    by module.

    Handles storage and retrieval of sensitive data like:
    - SSO certificates and client secrets
    - Backup encryption keys
    - Other module-specific secrets

    If AWS is not configured, the service will log warnings and return None
    for all operations (graceful degradation).
    """

    def __init__(self, prefix: str):
        """
        Initialize SecretsService with a module prefix.

        Args:
            prefix: Module prefix for organizing secrets (e.g., 'sso', 'backup')
        """
        self.client = None
        self.prefix = f"{getattr(settings, 'ENVIRONMENT_NAME', 'dev')}/{prefix}"
        self._init_client()

    def _init_client(self):
        """Initialize the boto3 client, handling missing AWS configuration gracefully."""
        try:
            self.client = boto3.client(
                "secretsmanager",
                region_name=getattr(settings, "AWS_REGION", "us-east-1"),
                endpoint_url=getattr(settings, "AWS_ENDPOINT_URL", None),
            )
        except Exception as e:
            logger.warning(
                f"Failed to initialize AWS Secrets Manager client: {e}. Secrets Manager features will be unavailable."
            )
            self.client = None

    def _get_secret_name(self, tenant_id: str, secret_type: str) -> str:
        """Generate a standardized secret name."""
        return f"{self.prefix}/{tenant_id}/{secret_type}"

    def store_secret(
        self,
        tenant_id: str,
        secret_type: str,
        secret_value: str,
        description: str = "",
        tags: Optional[dict] = None,
    ) -> Optional[str]:
        """
        Store a secret in AWS Secrets Manager.

        Args:
            tenant_id: The tenant identifier
            secret_type: Type of secret (e.g., 'saml_certificate', 'encryption_key')
            secret_value: The secret value to store
            description: Human-readable description
            tags: Optional additional tags to add (will be merged with default tags)

        Returns:
            The ARN of the stored secret, or None if unavailable
        """
        if not self.client:
            logger.warning("AWS Secrets Manager client not available, cannot store secret")
            return None

        secret_name = self._get_secret_name(tenant_id, secret_type)

        # Build tags
        default_tags = [
            {'Key': 'tenant_id', 'Value': str(tenant_id)},
            {'Key': 'module', 'Value': self.prefix.split('/')[-1]},  # Extract module name from prefix
            {'Key': 'secret_type', 'Value': secret_type},
        ]
        if tags:
            # Merge additional tags, avoiding duplicates
            tag_keys = {tag['Key'] for tag in default_tags}
            for tag in tags:
                if tag['Key'] not in tag_keys:
                    default_tags.append(tag)

        try:
            # Try to create the secret
            response = self.client.create_secret(
                Name=secret_name,
                Description=description or f"{self.prefix.split('/')[-1].upper()} {secret_type} for tenant {tenant_id}",
                SecretString=secret_value,
                Tags=default_tags,
            )
            return response["ARN"]

        except ClientError as e:
            if e.response["Error"]["Code"] == "ResourceExistsException":
                # Secret already exists, update it
                response = self.client.put_secret_value(
                    SecretId=secret_name,
                    SecretString=secret_value,
                )
                # Get the ARN from describe
                describe_response = self.client.describe_secret(SecretId=secret_name)
                return describe_response["ARN"]
            else:
                logger.error(f"Error storing secret: {e}")
                return None

    def get_secret(self, secret_arn: str) -> Optional[str]:
        """
        Retrieve a secret from AWS Secrets Manager.

        Args:
            secret_arn: The ARN or name of the secret

        Returns:
            The secret value, or None if not found/unavailable
        """
        if not self.client:
            logger.debug("AWS Secrets Manager client not available, skipping secret retrieval")
            return None

        try:
            response = self.client.get_secret_value(SecretId=secret_arn)
            return response.get("SecretString")
        except ClientError as e:
            if e.response["Error"]["Code"] == "ResourceNotFoundException":
                logger.warning(f"Secret not found: {secret_arn}")
                return None
            else:
                logger.error(f"Error retrieving secret: {e}")
                return None  # Gracefully return None instead of raising

    def get_secret_by_name(self, tenant_id: str, secret_type: str) -> Optional[str]:
        """
        Retrieve a secret by tenant ID and secret type (convenience method).

        Args:
            tenant_id: The tenant identifier
            secret_type: Type of secret

        Returns:
            The secret value, or None if not found/unavailable
        """
        secret_name = self._get_secret_name(tenant_id, secret_type)
        return self.get_secret(secret_name)

    def delete_secret(self, secret_arn: str, force: bool = False) -> bool:
        """
        Delete a secret from AWS Secrets Manager.

        Args:
            secret_arn: The ARN or name of the secret
            force: If True, delete immediately without recovery window

        Returns:
            True if deleted successfully
        """
        if not self.client:
            logger.warning("AWS Secrets Manager client not available, cannot delete secret")
            return False

        try:
            self.client.delete_secret(
                SecretId=secret_arn,
                ForceDeleteWithoutRecovery=force,
            )
            return True
        except ClientError as e:
            logger.error(f"Error deleting secret: {e}")
            return False

    def store_saml_certificate(
        self,
        tenant_id: str,
        connection_id: str,
        certificate: str,
    ) -> str:
        """Store a SAML IdP certificate."""
        return self.store_secret(
            tenant_id=tenant_id,
            secret_type=f"saml_certificate_{connection_id}",
            secret_value=certificate,
            description=f"SAML IdP certificate for SSO connection {connection_id}",
        )

    def store_sp_signing_key(
        self,
        tenant_id: str,
        connection_id: str,
        private_key: str,
        certificate: str,
    ) -> str:
        """Store SP signing key pair (private key + certificate)."""
        key_pair = json.dumps(
            {
                "private_key": private_key,
                "certificate": certificate,
            }
        )
        return self.store_secret(
            tenant_id=tenant_id,
            secret_type=f"sp_signing_key_{connection_id}",
            secret_value=key_pair,
            description=f"SP signing key pair for SSO connection {connection_id}",
        )

    def get_sp_signing_key(self, secret_arn: str) -> Optional[Dict[str, str]]:
        """Get SP signing key pair."""
        secret = self.get_secret(secret_arn)
        if secret:
            return json.loads(secret)
        return None

    def store_oidc_client_secret(
        self,
        tenant_id: str,
        connection_id: str,
        client_secret: str,
    ) -> str:
        """Store an OIDC client secret."""
        return self.store_secret(
            tenant_id=tenant_id,
            secret_type=f"oidc_client_secret_{connection_id}",
            secret_value=client_secret,
            description=f"OIDC client secret for SSO connection {connection_id}",
        )

    def rotate_secret(self, secret_arn: str, new_value: str) -> bool:
        """
        Rotate a secret with a new value.

        Args:
            secret_arn: The ARN of the secret to rotate
            new_value: The new secret value

        Returns:
            True if rotated successfully
        """
        if not self.client:
            logger.warning("AWS Secrets Manager client not available, cannot rotate secret")
            return False

        try:
            self.client.put_secret_value(
                SecretId=secret_arn,
                SecretString=new_value,
            )
            return True
        except ClientError as e:
            logger.error(f"Error rotating secret: {e}")
            return False


# Cache for service instances by prefix
_secrets_services: dict[str, SecretsService] = {}


def get_secrets_service(prefix: str) -> SecretsService:
    """
    Get a SecretsService instance for the given prefix.

    Instances are cached per prefix to avoid creating multiple instances
    for the same module.

    Args:
        prefix: Module prefix (e.g., 'sso', 'backup')

    Returns:
        SecretsService instance configured for the given prefix
    """
    if prefix not in _secrets_services:
        _secrets_services[prefix] = SecretsService(prefix=prefix)
    return _secrets_services[prefix]
