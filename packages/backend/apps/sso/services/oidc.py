"""
OpenID Connect (OIDC) Relying Party implementation.
Uses authlib for OIDC protocol handling.
"""

import logging
import secrets
import hashlib
import base64
from typing import Optional, Dict, Any, Tuple
from urllib.parse import urlencode, urlparse

import requests
from django.conf import settings
from django.core.cache import cache

from .secrets import get_secrets_service

logger = logging.getLogger(__name__)


class OIDCService:
    """
    OpenID Connect Relying Party implementation.
    Handles OIDC authentication flows including authorization code flow with PKCE.
    """
    
    # Cache TTLs
    DISCOVERY_CACHE_TTL = 3600  # 1 hour
    JWKS_CACHE_TTL = 3600  # 1 hour
    
    def __init__(self, sso_connection):
        """
        Initialize OIDC service for a specific SSO connection.
        
        Args:
            sso_connection: TenantSSOConnection instance configured for OIDC
        """
        self.connection = sso_connection
        self.tenant = sso_connection.tenant
        self.secrets_service = get_secrets_service()
    
    def get_callback_url(self) -> str:
        """Get the OAuth callback URL."""
        base_url = getattr(settings, 'API_URL', 'http://localhost:5001')
        return f"{base_url}/api/sso/oidc/{self.connection.id}/callback"
    
    def get_client_secret(self) -> Optional[str]:
        """Retrieve the client secret."""
        # First check if we have a direct client secret (for local development)
        if self.connection.oidc_client_secret:
            return self.connection.oidc_client_secret
        # Then check AWS Secrets Manager
        if self.connection.oidc_client_secret_arn:
            return self.secrets_service.get_secret(self.connection.oidc_client_secret_arn)
        return None
    
    def discover_configuration(self) -> Dict[str, Any]:
        """
        Fetch OIDC discovery document.
        Uses caching to avoid repeated requests.
        
        Returns:
            OIDC configuration from well-known endpoint
        """
        cache_key = f"oidc_discovery_{self.connection.id}"
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        discovery_url = f"{self.connection.oidc_issuer.rstrip('/')}/.well-known/openid-configuration"
        
        try:
            response = requests.get(discovery_url, timeout=10)
            response.raise_for_status()
            config = response.json()
            
            cache.set(cache_key, config, self.DISCOVERY_CACHE_TTL)
            return config
        except requests.RequestException as e:
            logger.error(f"OIDC discovery failed: {e}")
            raise ValueError(f"Failed to fetch OIDC configuration: {e}")
    
    def get_authorization_endpoint(self) -> str:
        """Get the authorization endpoint URL."""
        if self.connection.oidc_authorization_endpoint:
            return self.connection.oidc_authorization_endpoint
        
        config = self.discover_configuration()
        return config.get('authorization_endpoint', '')
    
    def get_token_endpoint(self) -> str:
        """Get the token endpoint URL."""
        if self.connection.oidc_token_endpoint:
            return self.connection.oidc_token_endpoint
        
        config = self.discover_configuration()
        return config.get('token_endpoint', '')
    
    def get_userinfo_endpoint(self) -> str:
        """Get the userinfo endpoint URL."""
        if self.connection.oidc_userinfo_endpoint:
            return self.connection.oidc_userinfo_endpoint
        
        config = self.discover_configuration()
        return config.get('userinfo_endpoint', '')
    
    def get_jwks_uri(self) -> str:
        """Get the JWKS URI."""
        if self.connection.oidc_jwks_uri:
            return self.connection.oidc_jwks_uri
        
        config = self.discover_configuration()
        return config.get('jwks_uri', '')
    
    @staticmethod
    def generate_pkce() -> Tuple[str, str]:
        """
        Generate PKCE code verifier and challenge.
        
        Returns:
            Tuple of (code_verifier, code_challenge)
        """
        # Generate code verifier (43-128 characters, unreserved URI characters)
        code_verifier = secrets.token_urlsafe(64)
        
        # Generate code challenge (SHA256 hash, base64url encoded)
        digest = hashlib.sha256(code_verifier.encode('utf-8')).digest()
        code_challenge = base64.urlsafe_b64encode(digest).rstrip(b'=').decode('utf-8')
        
        return code_verifier, code_challenge
    
    @staticmethod
    def generate_state() -> str:
        """Generate a random state value."""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def generate_nonce() -> str:
        """Generate a random nonce value."""
        return secrets.token_urlsafe(32)
    
    def create_authorization_url(
        self,
        state: str = None,
        nonce: str = None,
        code_challenge: str = None,
        prompt: str = None,
        login_hint: str = None,
    ) -> Tuple[str, Dict[str, str]]:
        """
        Create the OIDC authorization URL.
        
        Args:
            state: State value for CSRF protection
            nonce: Nonce for replay protection
            code_challenge: PKCE code challenge
            prompt: OpenID prompt parameter (none, login, consent, select_account)
            login_hint: Email hint for IdP
        
        Returns:
            Tuple of (authorization_url, auth_params_to_store)
        """
        state = state or self.generate_state()
        nonce = nonce or self.generate_nonce()
        
        params = {
            'client_id': self.connection.oidc_client_id,
            'response_type': 'code',
            'redirect_uri': self.get_callback_url(),
            'scope': self.connection.oidc_scopes,
            'state': state,
            'nonce': nonce,
        }
        
        if code_challenge:
            params['code_challenge'] = code_challenge
            params['code_challenge_method'] = 'S256'
        
        if prompt:
            params['prompt'] = prompt
        
        if login_hint:
            params['login_hint'] = login_hint
        
        auth_endpoint = self.get_authorization_endpoint()
        authorization_url = f"{auth_endpoint}?{urlencode(params)}"
        
        # Return params that need to be stored for callback validation
        auth_params = {
            'state': state,
            'nonce': nonce,
        }
        
        return authorization_url, auth_params
    
    def exchange_code_for_tokens(
        self,
        code: str,
        code_verifier: str = None,
    ) -> Dict[str, Any]:
        """
        Exchange authorization code for tokens.
        
        Args:
            code: Authorization code from callback
            code_verifier: PKCE code verifier (if PKCE was used)
        
        Returns:
            Token response containing access_token, id_token, etc.
        """
        token_endpoint = self.get_token_endpoint()
        client_secret = self.get_client_secret()
        
        data = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': self.get_callback_url(),
            'client_id': self.connection.oidc_client_id,
        }
        
        if client_secret:
            data['client_secret'] = client_secret
        
        if code_verifier:
            data['code_verifier'] = code_verifier
        
        try:
            response = requests.post(
                token_endpoint,
                data=data,
                timeout=30,
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Token exchange failed: {e}")
            raise ValueError(f"Failed to exchange code for tokens: {e}")
    
    def validate_id_token(
        self,
        id_token: str,
        nonce: str = None,
    ) -> Dict[str, Any]:
        """
        Validate and decode an ID token.
        
        Args:
            id_token: JWT ID token
            nonce: Expected nonce value
        
        Returns:
            Decoded token claims
        
        Raises:
            ValueError: If token validation fails
        """
        try:
            import jwt
            from jwt import PyJWKClient
        except ImportError:
            raise ImportError("PyJWT with jwcrypto support is required for OIDC")
        
        try:
            # Get JWKS
            jwks_uri = self.get_jwks_uri()
            jwks_client = PyJWKClient(jwks_uri)
            signing_key = jwks_client.get_signing_key_from_jwt(id_token)
            
            # Decode and validate
            claims = jwt.decode(
                id_token,
                signing_key.key,
                algorithms=['RS256', 'ES256'],
                audience=self.connection.oidc_client_id,
                issuer=self.connection.oidc_issuer,
            )
            
            # Validate nonce if provided
            if nonce and claims.get('nonce') != nonce:
                raise ValueError("Nonce mismatch")
            
            return claims
            
        except jwt.InvalidTokenError as e:
            logger.error(f"ID token validation failed: {e}")
            raise ValueError(f"Invalid ID token: {e}")
    
    def get_userinfo(self, access_token: str) -> Dict[str, Any]:
        """
        Fetch user information from the userinfo endpoint.
        
        Args:
            access_token: Access token from token exchange
        
        Returns:
            User information claims
        """
        userinfo_endpoint = self.get_userinfo_endpoint()
        
        try:
            response = requests.get(
                userinfo_endpoint,
                headers={'Authorization': f'Bearer {access_token}'},
                timeout=30,
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Userinfo request failed: {e}")
            raise ValueError(f"Failed to fetch user info: {e}")
    
    def process_callback(
        self,
        code: str,
        state: str,
        stored_state: str,
        stored_nonce: str,
        code_verifier: str = None,
    ) -> Dict[str, Any]:
        """
        Process the OAuth callback.
        
        Args:
            code: Authorization code
            state: State from callback
            stored_state: Originally stored state
            stored_nonce: Originally stored nonce
            code_verifier: PKCE code verifier
        
        Returns:
            Dict containing user attributes
        """
        # Validate state
        if state != stored_state:
            raise ValueError("State mismatch - possible CSRF attack")
        
        # Exchange code for tokens
        tokens = self.exchange_code_for_tokens(code, code_verifier)
        
        # Validate ID token
        id_token = tokens.get('id_token')
        if id_token:
            claims = self.validate_id_token(id_token, stored_nonce)
        else:
            claims = {}
        
        # Get additional user info if needed
        access_token = tokens.get('access_token')
        if access_token:
            try:
                userinfo = self.get_userinfo(access_token)
                claims.update(userinfo)
            except Exception as e:
                logger.warning(f"Failed to fetch userinfo: {e}")
        
        # Map claims to user attributes
        return self._map_claims(claims)
    
    def _map_claims(self, claims: Dict[str, Any]) -> Dict[str, Any]:
        """Map OIDC claims to user fields using connection configuration."""
        mapping = self.connection.oidc_claim_mapping or {
            # Standard OIDC claims
            'email': ['email'],
            'first_name': ['given_name', 'first_name'],
            'last_name': ['family_name', 'last_name'],
            'groups': ['groups', 'roles'],
            'sub': ['sub'],
        }
        
        result = {}
        for target_field, source_claims in mapping.items():
            if isinstance(source_claims, str):
                source_claims = [source_claims]
            
            for source_claim in source_claims:
                if source_claim in claims:
                    result[target_field] = claims[source_claim]
                    break
        
        # Use 'sub' as the IdP user ID
        result['idp_user_id'] = claims.get('sub', claims.get('email'))
        
        # Ensure groups is always a list
        if 'groups' in result and not isinstance(result['groups'], list):
            result['groups'] = [result['groups']]
        
        result['raw_claims'] = claims
        
        return result

