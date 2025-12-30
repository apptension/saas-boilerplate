"""
AWS Secrets Manager integration for storing SSO secrets securely.
"""

import json
import logging
from typing import Optional, Dict

import boto3
from botocore.exceptions import ClientError
from django.conf import settings

logger = logging.getLogger(__name__)


class SecretsService:
    """
    Service for managing SSO secrets in AWS Secrets Manager.
    Handles storage and retrieval of sensitive data like:
    - SAML certificates
    - OIDC client secrets
    - SP signing keys
    """

    def __init__(self):
        self.client = boto3.client(
            'secretsmanager',
            region_name=getattr(settings, 'AWS_REGION', 'us-east-1'),
            endpoint_url=getattr(settings, 'AWS_ENDPOINT_URL', None),
        )
        self.prefix = f"{getattr(settings, 'ENVIRONMENT_NAME', 'dev')}/sso"

    def _get_secret_name(self, tenant_id: str, secret_type: str) -> str:
        """Generate a standardized secret name."""
        return f"{self.prefix}/{tenant_id}/{secret_type}"

    def store_secret(
        self,
        tenant_id: str,
        secret_type: str,
        secret_value: str,
        description: str = '',
    ) -> str:
        """
        Store a secret in AWS Secrets Manager.

        Args:
            tenant_id: The tenant identifier
            secret_type: Type of secret (e.g., 'saml_certificate', 'oidc_client_secret')
            secret_value: The secret value to store
            description: Human-readable description

        Returns:
            The ARN of the stored secret
        """
        secret_name = self._get_secret_name(tenant_id, secret_type)

        try:
            # Try to create the secret
            response = self.client.create_secret(
                Name=secret_name,
                Description=description or f"SSO {secret_type} for tenant {tenant_id}",
                SecretString=secret_value,
                Tags=[
                    {'Key': 'tenant_id', 'Value': str(tenant_id)},
                    {'Key': 'type', 'Value': 'sso'},
                    {'Key': 'secret_type', 'Value': secret_type},
                ],
            )
            return response['ARN']

        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceExistsException':
                # Secret already exists, update it
                response = self.client.put_secret_value(
                    SecretId=secret_name,
                    SecretString=secret_value,
                )
                # Get the ARN from describe
                describe_response = self.client.describe_secret(SecretId=secret_name)
                return describe_response['ARN']
            else:
                logger.error(f"Error storing secret: {e}")
                raise

    def get_secret(self, secret_arn: str) -> Optional[str]:
        """
        Retrieve a secret from AWS Secrets Manager.

        Args:
            secret_arn: The ARN or name of the secret

        Returns:
            The secret value, or None if not found
        """
        try:
            response = self.client.get_secret_value(SecretId=secret_arn)
            return response.get('SecretString')
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceNotFoundException':
                logger.warning(f"Secret not found: {secret_arn}")
                return None
            else:
                logger.error(f"Error retrieving secret: {e}")
                raise

    def delete_secret(self, secret_arn: str, force: bool = False) -> bool:
        """
        Delete a secret from AWS Secrets Manager.

        Args:
            secret_arn: The ARN or name of the secret
            force: If True, delete immediately without recovery window

        Returns:
            True if deleted successfully
        """
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
                'private_key': private_key,
                'certificate': certificate,
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
        try:
            self.client.put_secret_value(
                SecretId=secret_arn,
                SecretString=new_value,
            )
            return True
        except ClientError as e:
            logger.error(f"Error rotating secret: {e}")
            return False


# Singleton instance
_secrets_service: Optional[SecretsService] = None


def get_secrets_service() -> SecretsService:
    """Get the singleton SecretsService instance."""
    global _secrets_service
    if _secrets_service is None:
        _secrets_service = SecretsService()
    return _secrets_service
