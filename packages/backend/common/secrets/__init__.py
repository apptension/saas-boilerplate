"""
Shared AWS Secrets Manager integration for storing secrets securely.

This module provides a generic SecretsService that can be used by any module
(e.g., SSO, backup) to store and retrieve secrets from AWS Secrets Manager.
"""

from .service import SecretsService, get_secrets_service

__all__ = ['SecretsService', 'get_secrets_service']
