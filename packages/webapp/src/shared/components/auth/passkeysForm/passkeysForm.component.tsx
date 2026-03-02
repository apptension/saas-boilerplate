import { Button } from '@sb/webapp-core/components/buttons';
import { Input } from '@sb/webapp-core/components/forms';
import { Badge } from '@sb/webapp-core/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@sb/webapp-core/components/ui/dialog';
import { Label } from '@sb/webapp-core/components/ui/label';
import { ENV } from '@sb/webapp-core/config/env';
import { useOpenState } from '@sb/webapp-core/hooks';
import { useToast } from '@sb/webapp-core/toast/useToast';
import {
  CheckCircle2,
  Fingerprint,
  Key,
  Loader2,
  Plus,
  Shield,
  Smartphone,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { useTenantPasskeys } from '@sb/webapp-tenants/hooks';

interface Passkey {
  id: string;
  name: string;
  authenticatorType: string;
  createdAt: string;
  lastUsedAt: string | null;
  useCount: number;
}

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

const getAuthenticatorIcon = (type: string) => {
  switch (type) {
    case 'platform':
      return <Smartphone className="h-4 w-4" />;
    case 'cross-platform':
      return <Key className="h-4 w-4" />;
    default:
      return <Fingerprint className="h-4 w-4" />;
  }
};

export const PasskeysForm = () => {
  const intl = useIntl();
  const { toast } = useToast();
  const { isOpen: isModalOpen, setIsOpen: setIsModalOpen } = useOpenState(false);

  const [deleting, setDeleting] = useState<string | null>(null);

  const [passkeyName, setPasskeyName] = useState('');
  const [step, setStep] = useState<RegistrationStep>('name');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isSupported =
    ENV.ENABLE_PASSKEYS && typeof window !== 'undefined' && !!window.PublicKeyCredential;

  const { passkeys, loading, refetch, deletePasskey } = useTenantPasskeys(undefined, false);

  const handleDeletePasskey = async (passkeyId: string) => {
    setDeleting(passkeyId);
    try {
      await deletePasskey({ variables: { input: { id: passkeyId } } });
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Passkey deleted.',
          id: 'Passkeys / Delete success',
        }),
        variant: 'success',
      });
    } catch {
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Failed to delete passkey.',
          id: 'Passkeys / Delete error',
        }),
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  const openModal = useCallback(() => {
    setPasskeyName('');
    setStep('name');
    setErrorMessage('');
    setIsModalOpen(true);
  }, [setIsModalOpen]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, [setIsModalOpen]);

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
      setErrorMessage(
        intl.formatMessage({
          defaultMessage: 'Your browser does not support passkeys (WebAuthn).',
          id: 'Add Passkey Modal / Not Supported',
        })
      );
      return;
    }

    setIsRegistering(true);
    setErrorMessage('');

    try {
      // Step 1: Get registration options from the server
      const optionsResponse = await fetch(`${ENV.BASE_API_URL}/sso/passkeys/register/options`, {
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
        excludeCredentials: (options.excludeCredentials || []).map(
          (cred: { id: string; type: string }) => ({
            id: base64UrlToBuffer(cred.id),
            type: cred.type,
          })
        ),
      };

      // Step 3: Create the credential using WebAuthn API
      const credential = (await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      })) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Credential creation returned null');
      }

      const response = credential.response as AuthenticatorAttestationResponse;

      // Step 4: Send the credential to the server for verification
      const verifyResponse = await fetch(`${ENV.BASE_API_URL}/sso/passkeys/register/verify`, {
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

      // Refresh passkeys list and close modal after a delay
      setTimeout(() => {
        refetch();
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
  }, [passkeyName, intl, toast, refetch, closeModal]);

  const handleRetry = () => {
    setStep('name');
    setErrorMessage('');
  };

  if (!isSupported) {
    return (
      <div className="rounded-lg border border-muted bg-muted/30 p-4 text-center">
        <Shield className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          <FormattedMessage
            defaultMessage="Passkeys are not supported in this browser or have been disabled."
            id="Passkeys / Not supported"
          />
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          <FormattedMessage
            defaultMessage="Passkeys let you sign in securely using your fingerprint, face, or device PIN - no password required."
            id="Passkeys / Description"
          />
        </p>

        {passkeys.length === 0 ? (
          <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center">
            <Fingerprint className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="mb-4 text-sm text-muted-foreground">
              <FormattedMessage
                defaultMessage="You haven't registered any passkeys yet. Add one for faster, more secure sign-in."
                id="Passkeys / Empty state"
              />
            </p>
            <Button onClick={openModal}>
              <Plus className="mr-2 h-4 w-4" />
              <FormattedMessage defaultMessage="Add Passkey" id="Passkeys / Add button" />
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {passkeys.map((passkey) => (
                <div
                  key={passkey.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      {getAuthenticatorIcon(passkey.authenticatorType)}
                    </div>
                    <div>
                      <p className="font-medium">{passkey.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {passkey.authenticatorType === 'platform' ? (
                            <FormattedMessage defaultMessage="This device" id="Passkeys / Platform" />
                          ) : (
                            <FormattedMessage
                              defaultMessage="Security key"
                              id="Passkeys / Cross-platform"
                            />
                          )}
                        </Badge>
                        <span>•</span>
                        <span>
                          <FormattedMessage
                            defaultMessage="Created {date}"
                            id="Passkeys / Created date"
                            values={{ date: new Date(passkey.createdAt as string).toLocaleDateString() }}
                          />
                        </span>
                        {passkey.lastUsedAt != null && (
                          <>
                            <span>•</span>
                            <span>
                              <FormattedMessage
                                defaultMessage="Last used {date}"
                                id="Passkeys / Last used date"
                                values={{ date: new Date(passkey.lastUsedAt as string).toLocaleDateString() }}
                              />
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePasskey(passkey.id)}
                    disabled={deleting === passkey.id}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    {deleting === passkey.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={openModal}>
              <Plus className="mr-2 h-4 w-4" />
              <FormattedMessage defaultMessage="Add another passkey" id="Passkeys / Add another" />
            </Button>
          </>
        )}
      </div>

      {/* Add Passkey Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[450px]" aria-describedby="passkey-dialog-description">
          {/* Visually hidden but accessible title and description for screen readers */}
          <DialogTitle className="sr-only">
            <FormattedMessage defaultMessage="Register a Passkey" id="Add Passkey Modal / Title" />
          </DialogTitle>
          <DialogDescription id="passkey-dialog-description" className="sr-only">
            <FormattedMessage
              defaultMessage="Secure, passwordless sign-in"
              id="Add Passkey Modal / Subtitle"
            />
          </DialogDescription>
          <div className="-m-6 flex h-[85vh] max-h-[500px] flex-col overflow-hidden sm:rounded-lg">
            {/* Fixed Header */}
            <div className="flex shrink-0 items-center gap-3 border-b bg-background px-6 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Fingerprint className="h-5 w-5 text-primary" />
              </div>
              <div className="mr-8">
                <h2 className="text-lg font-semibold" aria-hidden="true">
                  <FormattedMessage defaultMessage="Register a Passkey" id="Add Passkey Modal / Title" />
                </h2>
                <p className="text-sm text-muted-foreground" aria-hidden="true">
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
                    <div className="flex flex-col items-center rounded-lg bg-muted/30 p-3 text-center">
                      <Fingerprint className="mb-2 h-6 w-6 text-primary" />
                      <span className="text-xs font-medium">
                        <FormattedMessage defaultMessage="Biometrics" id="Add Passkey Modal / Biometrics" />
                      </span>
                    </div>
                    <div className="flex flex-col items-center rounded-lg bg-muted/30 p-3 text-center">
                      <Shield className="mb-2 h-6 w-6 text-primary" />
                      <span className="text-xs font-medium">
                        <FormattedMessage
                          defaultMessage="Phishing-Proof"
                          id="Add Passkey Modal / Phishing Proof"
                        />
                      </span>
                    </div>
                    <div className="flex flex-col items-center rounded-lg bg-muted/30 p-3 text-center">
                      <Key className="mb-2 h-6 w-6 text-primary" />
                      <span className="text-xs font-medium">
                        <FormattedMessage defaultMessage="No Password" id="Add Passkey Modal / No Password" />
                      </span>
                    </div>
                  </div>

                  {/* Name Input */}
                  <div className="space-y-3">
                    <Label htmlFor="passkey-name" className="text-sm font-medium">
                      <FormattedMessage
                        defaultMessage="Give your passkey a name"
                        id="Add Passkey Modal / Name Label"
                      />
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
                      <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                      <div className="text-sm text-muted-foreground">
                        <p className="mb-1 font-medium text-foreground">
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
                <div className="flex h-full flex-col items-center justify-center space-y-6 py-8">
                  <div className="flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-primary/10">
                    <Fingerprint className="h-12 w-12 text-primary" />
                  </div>
                  <div className="space-y-2 text-center">
                    <h3 className="text-lg font-semibold">
                      <FormattedMessage
                        defaultMessage="Complete registration on your device"
                        id="Add Passkey Modal / Register Title"
                      />
                    </h3>
                    <p className="max-w-[300px] text-sm text-muted-foreground">
                      <FormattedMessage
                        defaultMessage="When prompted, use Touch ID, Face ID, or your security key to register."
                        id="Add Passkey Modal / Register Description"
                      />
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="rounded bg-muted px-2 py-1 font-mono text-xs">{passkeyName}</span>
                  </div>
                  {isRegistering && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <FormattedMessage
                        defaultMessage="Waiting for authenticator..."
                        id="Add Passkey Modal / Waiting"
                      />
                    </div>
                  )}
                </div>
              )}

              {step === 'success' && (
                <div className="flex h-full flex-col items-center justify-center space-y-6 py-8">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-2 text-center">
                    <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                      <FormattedMessage
                        defaultMessage="Passkey Registered!"
                        id="Add Passkey Modal / Success Title"
                      />
                    </h3>
                    <p className="max-w-[300px] text-sm text-muted-foreground">
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
                <div className="flex h-full flex-col items-center justify-center space-y-6 py-8">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="space-y-2 text-center">
                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">
                      <FormattedMessage
                        defaultMessage="Registration Failed"
                        id="Add Passkey Modal / Error Title"
                      />
                    </h3>
                    <p className="max-w-[300px] text-sm text-muted-foreground">{errorMessage}</p>
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
                  <FormattedMessage
                    defaultMessage="Cancel"
                    id="Add Passkey Modal / Cancel Registration"
                  />
                </Button>
              )}

              {step === 'success' && (
                <Button type="button" onClick={closeModal} className="w-full">
                  <FormattedMessage defaultMessage="Done" id="Add Passkey Modal / Done Button" />
                </Button>
              )}

              {step === 'error' && (
                <>
                  <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
                    <FormattedMessage defaultMessage="Cancel" id="Add Passkey Modal / Cancel Error" />
                  </Button>
                  <Button type="button" onClick={handleRetry} className="flex-1">
                    <FormattedMessage defaultMessage="Try Again" id="Add Passkey Modal / Retry Button" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
