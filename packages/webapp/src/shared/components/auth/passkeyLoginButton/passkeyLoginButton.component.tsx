import { Button } from '@sb/webapp-core/components/ui/button';
import { ENV } from '@sb/webapp-core/config/env';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { Fingerprint } from 'lucide-react';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router-dom';

// Helper to decode base64url to Uint8Array
const base64UrlToUint8Array = (base64url: string): Uint8Array => {
  // Convert base64url to base64
  const base64 = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(base64url.length + (4 - (base64url.length % 4)) % 4, '=');

  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Helper to encode Uint8Array to base64url
const uint8ArrayToBase64Url = (bytes: Uint8Array): string => {
  const binaryString = String.fromCharCode(...bytes);
  const base64 = btoa(binaryString);
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

/**
 * Passkey Login Button
 *
 * Allows users to authenticate using WebAuthn passkeys (biometrics, security keys).
 * Only shown if ENABLE_PASSKEYS feature flag is enabled.
 */
export const PasskeyLoginButton = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { search } = useLocation();

  // Check if passkeys feature is enabled
  if (!ENV.ENABLE_PASSKEYS) {
    return null;
  }

  // Check if WebAuthn is supported
  if (!window.PublicKeyCredential) {
    return null;
  }

  const handlePasskeyLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Get authentication options from backend
      const optionsResponse = await fetch(`${ENV.BASE_API_URL}/sso/passkeys/authenticate/options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
        credentials: 'include',
      });

      if (!optionsResponse.ok) {
        throw new Error('Failed to get authentication options');
      }

      const options = await optionsResponse.json();

      // 2. Create credential request (using base64url decoding)
      const publicKeyOptions: PublicKeyCredentialRequestOptions = {
        challenge: base64UrlToUint8Array(options.challenge) as BufferSource,
        timeout: options.timeout || 60000,
        rpId: options.rpId || window.location.hostname,
        userVerification: options.userVerification || 'preferred',
        allowCredentials: options.allowCredentials?.map((cred: { id: string; type: string; transports?: string[] }) => ({
          id: base64UrlToUint8Array(cred.id),
          type: cred.type,
          transports: cred.transports,
        })),
      };

      // 3. Get credential from browser
      const credential = await navigator.credentials.get({
        publicKey: publicKeyOptions,
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('No credential returned');
      }

      const response = credential.response as AuthenticatorAssertionResponse;

      // 4. Verify with backend (using base64url encoding)
      const verifyResponse = await fetch(`${ENV.BASE_API_URL}/sso/passkeys/authenticate/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge: options.challenge,
          credentialId: uint8ArrayToBase64Url(new Uint8Array(credential.rawId)),
          authenticatorData: uint8ArrayToBase64Url(new Uint8Array(response.authenticatorData)),
          clientDataJSON: uint8ArrayToBase64Url(new Uint8Array(response.clientDataJSON)),
          signature: uint8ArrayToBase64Url(new Uint8Array(response.signature)),
          userHandle: response.userHandle
            ? uint8ArrayToBase64Url(new Uint8Array(response.userHandle))
            : null,
        }),
        credentials: 'include',
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || 'Authentication failed');
      }

      // Backend sets cookies directly, we just need to redirect
      trackEvent('auth', 'passkey-login');

      // Parse the 'redirect' param from search if available (consistent with regular login)
      const params = new URLSearchParams(search);
      const redirect = params.get('redirect');

      // Get locale for default redirect
      const localeMatch = window.location.pathname.match(/^\/([a-z]{2})\//);
      const locale = localeMatch ? localeMatch[1] : 'en';
      const defaultRedirect = `/${locale}/`;

      // Force a full page reload to reinitialize with new auth cookies
      window.location.href = redirect || defaultRedirect;

    } catch (err) {
      console.error('Passkey login error:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Authentication was cancelled or timed out.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to authenticate with passkey.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        size="lg"
        className="w-full"
        onClick={handlePasskeyLogin}
        disabled={loading}
      >
        <Fingerprint className="mr-2 h-5 w-5" />
        {loading ? (
          <FormattedMessage defaultMessage="Authenticating..." id="Auth / Passkey / loading" />
        ) : (
          <FormattedMessage defaultMessage="Sign in with Passkey" id="Auth / Passkey / button" />
        )}
      </Button>
      {error && (
        <p className="text-center text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

