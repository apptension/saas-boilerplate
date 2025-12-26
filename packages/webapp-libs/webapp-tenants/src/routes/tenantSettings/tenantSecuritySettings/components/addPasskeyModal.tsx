import { useState, useCallback } from 'react';
import { Button } from '@sb/webapp-core/components/buttons';
import { Input } from '@sb/webapp-core/components/forms';
import { Label } from '@sb/webapp-core/components/ui/label';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { Fingerprint, Smartphone, Key, Shield, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';

export type AddPasskeyModalProps = {
  closeModal: () => void;
  onSuccess?: () => void;
};

type RegistrationStep = 'name' | 'register' | 'success' | 'error';

// Helper to convert base64url to ArrayBuffer
const base64UrlToBuffer = (base64url: string): ArrayBuffer => {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

// Helper to convert ArrayBuffer to base64url
const bufferToBase64Url = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

export const AddPasskeyModal = ({ closeModal, onSuccess }: AddPasskeyModalProps) => {
  const intl = useIntl();
  const { toast } = useToast();

  const [passkeyName, setPasskeyName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [step, setStep] = useState<RegistrationStep>('name');
  const [errorMessage, setErrorMessage] = useState('');

  const handleContinue = () => {
    if (!passkeyName.trim()) return;
    setStep('register');
    // Auto-start registration after a short delay
    setTimeout(() => handleRegister(), 500);
  };

  const handleRegister = useCallback(async () => {
    // Check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
      setStep('error');
      setErrorMessage(intl.formatMessage({
        defaultMessage: 'Your browser does not support passkeys (WebAuthn).',
        id: 'Add Passkey Modal / Not Supported',
      }));
      return;
    }

    setIsRegistering(true);
    setErrorMessage('');

    try {
      // Step 1: Get registration options from the server
      const optionsResponse = await fetch('/api/sso/passkeys/register/options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userVerification: 'preferred',
          requireResidentKey: true,
        }),
      });

      if (!optionsResponse.ok) {
        throw new Error('Failed to get registration options from server');
      }

      const options = await optionsResponse.json();

      // Step 2: Convert server options to WebAuthn format
      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: base64UrlToBuffer(options.challenge),
        rp: {
          name: options.rp.name,
          id: options.rp.id,
        },
        user: {
          id: base64UrlToBuffer(options.user.id),
          name: options.user.name,
          displayName: options.user.displayName,
        },
        pubKeyCredParams: options.pubKeyCredParams,
        timeout: options.timeout,
        attestation: options.attestation || 'none',
        authenticatorSelection: options.authenticatorSelection,
        excludeCredentials: (options.excludeCredentials || []).map((cred: { id: string; type: string }) => ({
          id: base64UrlToBuffer(cred.id),
          type: cred.type,
        })),
      };

      // Step 3: Create the credential using WebAuthn API
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Credential creation returned null');
      }

      const response = credential.response as AuthenticatorAttestationResponse;

      // Step 4: Send the credential to the server for verification
      const verifyResponse = await fetch('/api/sso/passkeys/register/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          challenge: options.challenge,
          credentialId: bufferToBase64Url(credential.rawId),
          publicKey: bufferToBase64Url(response.getPublicKey?.() || new ArrayBuffer(0)),
          attestationObject: bufferToBase64Url(response.attestationObject),
          clientDataJSON: bufferToBase64Url(response.clientDataJSON),
          name: passkeyName,
          transports: response.getTransports?.() || [],
        }),
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        throw new Error(error.error || 'Failed to verify registration');
      }

      // Success!
      setStep('success');
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Passkey registered successfully!',
          id: 'Add Passkey Modal / Success',
        }),
        variant: 'success',
      });

      // Call success callback and close after a delay
      setTimeout(() => {
        onSuccess?.();
        closeModal();
      }, 1500);

    } catch (error) {
      console.error('Passkey registration error:', error);
      setStep('error');
      
      let message = intl.formatMessage({
        defaultMessage: 'Failed to register passkey. Please try again.',
        id: 'Add Passkey Modal / Error Generic',
      });

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          message = intl.formatMessage({
            defaultMessage: 'Registration was cancelled or timed out. Please try again.',
            id: 'Add Passkey Modal / Error Cancelled',
          });
        } else if (error.name === 'InvalidStateError') {
          message = intl.formatMessage({
            defaultMessage: 'This authenticator is already registered.',
            id: 'Add Passkey Modal / Error Already Registered',
          });
        } else if (error.name === 'NotSupportedError') {
          message = intl.formatMessage({
            defaultMessage: 'This authenticator type is not supported.',
            id: 'Add Passkey Modal / Error Not Supported',
          });
        } else if (error.message) {
          message = error.message;
        }
      }
      
      setErrorMessage(message);
    } finally {
      setIsRegistering(false);
    }
  }, [passkeyName, intl, toast, closeModal, onSuccess]);

  const handleRetry = () => {
    setStep('name');
    setErrorMessage('');
  };

  return (
    <div className="-m-6 flex h-[85vh] max-h-[500px] flex-col overflow-hidden sm:rounded-lg">
      {/* Fixed Header */}
      <div className="flex shrink-0 items-center gap-3 border-b bg-background px-6 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Fingerprint className="h-5 w-5 text-primary" />
        </div>
        <div className="mr-8">
          <h2 className="text-lg font-semibold">
            <FormattedMessage
              defaultMessage="Register a Passkey"
              id="Add Passkey Modal / Title"
            />
          </h2>
          <p className="text-sm text-muted-foreground">
            <FormattedMessage
              defaultMessage="Secure, passwordless sign-in"
              id="Add Passkey Modal / Subtitle"
            />
          </p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {step === 'name' && (
          <div className="space-y-6">
            {/* Benefits */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/30">
                <Fingerprint className="h-6 w-6 text-primary mb-2" />
                <span className="text-xs font-medium">
                  <FormattedMessage defaultMessage="Biometrics" id="Add Passkey Modal / Biometrics" />
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/30">
                <Shield className="h-6 w-6 text-primary mb-2" />
                <span className="text-xs font-medium">
                  <FormattedMessage defaultMessage="Phishing-Proof" id="Add Passkey Modal / Phishing Proof" />
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/30">
                <Key className="h-6 w-6 text-primary mb-2" />
                <span className="text-xs font-medium">
                  <FormattedMessage defaultMessage="No Password" id="Add Passkey Modal / No Password" />
                </span>
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-3">
              <Label htmlFor="passkey-name" className="text-sm font-medium">
                <FormattedMessage defaultMessage="Give your passkey a name" id="Add Passkey Modal / Name Label" />
              </Label>
              <Input
                id="passkey-name"
                placeholder={intl.formatMessage({
                  defaultMessage: 'e.g., MacBook Touch ID, iPhone Face ID',
                  id: 'Add Passkey Modal / Name Placeholder',
                })}
                value={passkeyName}
                onChange={(e) => setPasskeyName(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                <FormattedMessage
                  defaultMessage="This helps you identify your passkeys if you have multiple devices."
                  id="Add Passkey Modal / Name Help"
                />
              </p>
            </div>

            {/* Supported Devices */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">
                    <FormattedMessage
                      defaultMessage="Works with"
                      id="Add Passkey Modal / Works With"
                    />
                  </p>
                  <FormattedMessage
                    defaultMessage="Touch ID, Face ID, Windows Hello, Android Fingerprint, and hardware security keys like YubiKey."
                    id="Add Passkey Modal / Works With Description"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'register' && (
          <div className="flex flex-col items-center justify-center h-full space-y-6 py-8">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 animate-pulse">
              <Fingerprint className="h-12 w-12 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">
                <FormattedMessage
                  defaultMessage="Complete registration on your device"
                  id="Add Passkey Modal / Register Title"
                />
              </h3>
              <p className="text-sm text-muted-foreground max-w-[300px]">
                <FormattedMessage
                  defaultMessage="When prompted, use Touch ID, Face ID, or your security key to register."
                  id="Add Passkey Modal / Register Description"
                />
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-xs bg-muted px-2 py-1 rounded font-mono">
                {passkeyName}
              </span>
            </div>
            {isRegistering && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <FormattedMessage defaultMessage="Waiting for authenticator..." id="Add Passkey Modal / Waiting" />
              </div>
            )}
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center h-full space-y-6 py-8">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                <FormattedMessage
                  defaultMessage="Passkey Registered!"
                  id="Add Passkey Modal / Success Title"
                />
              </h3>
              <p className="text-sm text-muted-foreground max-w-[300px]">
                <FormattedMessage
                  defaultMessage="You can now use this passkey to sign in securely without a password."
                  id="Add Passkey Modal / Success Description"
                />
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{passkeyName}</span>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="flex flex-col items-center justify-center h-full space-y-6 py-8">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">
                <FormattedMessage
                  defaultMessage="Registration Failed"
                  id="Add Passkey Modal / Error Title"
                />
              </h3>
              <p className="text-sm text-muted-foreground max-w-[300px]">
                {errorMessage}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Footer */}
      <div className="flex shrink-0 gap-3 border-t bg-background px-6 py-4">
        {step === 'name' && (
          <>
            <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
              <FormattedMessage defaultMessage="Cancel" id="Add Passkey Modal / Cancel Button" />
            </Button>
            <Button 
              type="button" 
              onClick={handleContinue} 
              className="flex-1"
              disabled={!passkeyName.trim()}
            >
              <FormattedMessage defaultMessage="Continue" id="Add Passkey Modal / Continue Button" />
            </Button>
          </>
        )}

        {step === 'register' && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setStep('name')} 
            className="w-full"
            disabled={isRegistering}
          >
            <FormattedMessage defaultMessage="Cancel" id="Add Passkey Modal / Cancel Registration" />
          </Button>
        )}

        {step === 'success' && (
          <Button 
            type="button" 
            onClick={closeModal} 
            className="w-full"
          >
            <FormattedMessage defaultMessage="Done" id="Add Passkey Modal / Done Button" />
          </Button>
        )}

        {step === 'error' && (
          <>
            <Button 
              type="button" 
              variant="outline" 
              onClick={closeModal} 
              className="flex-1"
            >
              <FormattedMessage defaultMessage="Cancel" id="Add Passkey Modal / Cancel Error" />
            </Button>
            <Button 
              type="button" 
              onClick={handleRetry} 
              className="flex-1"
            >
              <FormattedMessage defaultMessage="Try Again" id="Add Passkey Modal / Retry Button" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
