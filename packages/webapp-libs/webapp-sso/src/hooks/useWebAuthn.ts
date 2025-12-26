/**
 * WebAuthn hook for passkey registration and authentication.
 */

import { useState, useCallback } from 'react';

const API_BASE = '/api/sso';

interface RegistrationOptions {
  challenge: string;
  rp: { name: string; id: string };
  user: { id: string; name: string; displayName: string };
  pubKeyCredParams: Array<{ type: string; alg: number }>;
  timeout: number;
  attestation: string;
  authenticatorSelection: {
    userVerification: string;
    residentKey: string;
    requireResidentKey: boolean;
    authenticatorAttachment?: string;
  };
  excludeCredentials: Array<{ id: string; type: string }>;
}

interface AuthenticationOptions {
  challenge: string;
  timeout: number;
  rpId: string;
  userVerification: string;
  allowCredentials?: Array<{ id: string; type: string; transports?: string[] }>;
}

function base64UrlToArrayBuffer(base64Url: string): ArrayBuffer {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function useWebAuthn() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported = typeof window !== 'undefined' && !!window.PublicKeyCredential;

  const registerPasskey = useCallback(
    async (name: string = 'My Passkey'): Promise<boolean> => {
      if (!isSupported) {
        setError('WebAuthn is not supported in this browser');
        return false;
      }

      setIsRegistering(true);
      setError(null);

      try {
        // Get registration options from server
        const optionsResponse = await fetch(`${API_BASE}/passkeys/register/options`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!optionsResponse.ok) {
          throw new Error('Failed to get registration options');
        }

        const options: RegistrationOptions = await optionsResponse.json();

        // Convert base64url to ArrayBuffer
        const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
          challenge: base64UrlToArrayBuffer(options.challenge),
          rp: options.rp,
          user: {
            id: base64UrlToArrayBuffer(options.user.id),
            name: options.user.name,
            displayName: options.user.displayName,
          },
          pubKeyCredParams: options.pubKeyCredParams as PublicKeyCredentialParameters[],
          timeout: options.timeout,
          attestation: options.attestation as AttestationConveyancePreference,
          authenticatorSelection: {
            userVerification: options.authenticatorSelection.userVerification as UserVerificationRequirement,
            residentKey: options.authenticatorSelection.residentKey as ResidentKeyRequirement,
            requireResidentKey: options.authenticatorSelection.requireResidentKey,
            authenticatorAttachment: options.authenticatorSelection.authenticatorAttachment as AuthenticatorAttachment | undefined,
          },
          excludeCredentials: options.excludeCredentials.map((cred) => ({
            id: base64UrlToArrayBuffer(cred.id),
            type: cred.type as PublicKeyCredentialType,
          })),
        };

        // Create credential
        const credential = (await navigator.credentials.create({
          publicKey: publicKeyCredentialCreationOptions,
        })) as PublicKeyCredential | null;

        if (!credential) {
          throw new Error('Failed to create credential');
        }

        const response = credential.response as AuthenticatorAttestationResponse;

        // Send to server for verification
        const verifyResponse = await fetch(`${API_BASE}/passkeys/register/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            challenge: options.challenge,
            credentialId: arrayBufferToBase64Url(credential.rawId),
            publicKey: arrayBufferToBase64Url(response.getPublicKey?.() || new ArrayBuffer(0)),
            attestationObject: arrayBufferToBase64Url(response.attestationObject),
            clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
            name,
            transports: response.getTransports?.() || [],
          }),
        });

        if (!verifyResponse.ok) {
          const errorData = await verifyResponse.json();
          throw new Error(errorData.error || 'Failed to verify registration');
        }

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed');
        return false;
      } finally {
        setIsRegistering(false);
      }
    },
    [isSupported]
  );

  const authenticateWithPasskey = useCallback(
    async (email?: string): Promise<{ access: string; refresh: string } | null> => {
      if (!isSupported) {
        setError('WebAuthn is not supported in this browser');
        return null;
      }

      setIsAuthenticating(true);
      setError(null);

      try {
        // Get authentication options from server
        const optionsResponse = await fetch(`${API_BASE}/passkeys/authenticate/options`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (!optionsResponse.ok) {
          throw new Error('Failed to get authentication options');
        }

        const options: AuthenticationOptions = await optionsResponse.json();

        // Convert base64url to ArrayBuffer
        const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
          challenge: base64UrlToArrayBuffer(options.challenge),
          timeout: options.timeout,
          rpId: options.rpId,
          userVerification: options.userVerification as UserVerificationRequirement,
          allowCredentials: options.allowCredentials?.map((cred) => ({
            id: base64UrlToArrayBuffer(cred.id),
            type: cred.type as PublicKeyCredentialType,
            transports: cred.transports as AuthenticatorTransport[] | undefined,
          })),
        };

        // Get credential
        const credential = (await navigator.credentials.get({
          publicKey: publicKeyCredentialRequestOptions,
        })) as PublicKeyCredential | null;

        if (!credential) {
          throw new Error('Failed to get credential');
        }

        const response = credential.response as AuthenticatorAssertionResponse;

        // Send to server for verification
        const verifyResponse = await fetch(`${API_BASE}/passkeys/authenticate/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challenge: options.challenge,
            credentialId: arrayBufferToBase64Url(credential.rawId),
            authenticatorData: arrayBufferToBase64Url(response.authenticatorData),
            clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
            signature: arrayBufferToBase64Url(response.signature),
            userHandle: response.userHandle
              ? arrayBufferToBase64Url(response.userHandle)
              : undefined,
          }),
        });

        if (!verifyResponse.ok) {
          const errorData = await verifyResponse.json();
          throw new Error(errorData.error || 'Authentication failed');
        }

        const tokens = await verifyResponse.json();
        return tokens;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
        return null;
      } finally {
        setIsAuthenticating(false);
      }
    },
    [isSupported]
  );

  return {
    isSupported,
    isRegistering,
    isAuthenticating,
    error,
    registerPasskey,
    authenticateWithPasskey,
  };
}

