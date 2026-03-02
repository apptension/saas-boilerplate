import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { 
  Fingerprint, 
  Plus, 
  Trash2, 
  Pencil,
  Smartphone,
  Key,
  Check,
} from 'lucide-react';

import { Button } from '@sb/webapp-core/components/buttons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { Badge } from '@sb/webapp-core/components/ui/badge';
import { Input } from '@sb/webapp-core/components/forms';
import { ConfirmDialog } from '@sb/webapp-core/components/confirmDialog';
import { useToast } from '@sb/webapp-core/toast/useToast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@sb/webapp-core/components/ui/dialog';

import { usePasskeys } from '../../hooks/usePasskeys';
import { useWebAuthn } from '../../hooks/useWebAuthn';

interface Passkey {
  id: string;
  name: string;
  authenticatorType: string;
  transports: string[];
  isActive: boolean;
  lastUsedAt?: string;
  useCount: number;
  createdAt: string;
}

export function PasskeysManager() {
  const intl = useIntl();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPasskeyName, setNewPasskeyName] = useState('');
  const [editingPasskey, setEditingPasskey] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const { passkeys, loading, refetch, renamePasskey, deletePasskey } = usePasskeys();
  const { isSupported, isRegistering, error: webAuthnError, registerPasskey } = useWebAuthn();

  const handleRegister = async () => {
    const name = newPasskeyName.trim() || 'My Passkey';
    const success = await registerPasskey(name);
    
    if (success) {
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Passkey registered successfully',
          id: 'Passkeys / Register success',
        }),
        variant: 'success',
      });
      setIsDialogOpen(false);
      setNewPasskeyName('');
      refetch();
    } else {
      toast({
        description: webAuthnError || intl.formatMessage({
          defaultMessage: 'Failed to register passkey',
          id: 'Passkeys / Register failed',
        }),
        variant: 'destructive',
      });
    }
  };

  const handleRename = async (passkeyId: string) => {
    try {
      await renamePasskey({
        variables: {
          id: passkeyId,
          name: editName,
        },
      });
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Passkey renamed',
          id: 'Passkeys / Rename success',
        }),
        variant: 'success',
      });
      setEditingPasskey(null);
      setEditName('');
    } catch (error) {
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Failed to rename passkey',
          id: 'Passkeys / Rename failed',
        }),
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (passkeyId: string) => {
    try {
      await deletePasskey({
        variables: {
          input: { id: passkeyId },
        },
      });
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Passkey removed',
          id: 'Passkeys / Delete success',
        }),
        variant: 'success',
      });
    } catch (error) {
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Failed to remove passkey',
          id: 'Passkeys / Delete failed',
        }),
        variant: 'destructive',
      });
    }
  };

  const getAuthenticatorIcon = (type: string, transports: string[]) => {
    if (transports.includes('internal') || type === 'platform') {
      return <Smartphone className="h-5 w-5" />;
    }
    return <Key className="h-5 w-5" />;
  };

  if (!isSupported) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Fingerprint className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            <FormattedMessage defaultMessage="Passkeys not supported" id="Passkeys / Not supported title" />
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            <FormattedMessage
              defaultMessage="Your browser doesn't support passkeys. Please use a modern browser like Chrome, Firefox, Safari, or Edge."
              id="Passkeys / Not supported description"
            />
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            <FormattedMessage defaultMessage="Passkeys" id="Passkeys / Title" />
          </h2>
          <p className="text-muted-foreground">
            <FormattedMessage
              defaultMessage="Use passkeys for fast, secure, passwordless sign-in"
              id="Passkeys / Description"
            />
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              <FormattedMessage defaultMessage="Add Passkey" id="Passkeys / Add passkey" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <FormattedMessage defaultMessage="Register a new passkey" id="Passkeys / Register title" />
              </DialogTitle>
              <DialogDescription>
                <FormattedMessage
                  defaultMessage="Give your passkey a name to identify it, then use your device's biometrics or security key to register."
                  id="Passkeys / Register description"
                />
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder={intl.formatMessage({
                  defaultMessage: 'e.g., MacBook Pro, iPhone 15',
                  id: 'Passkeys / Name placeholder',
                })}
                value={newPasskeyName}
                onChange={(e) => setNewPasskeyName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                <FormattedMessage defaultMessage="Cancel" id="Common / Cancel" />
              </Button>
              <Button onClick={handleRegister} disabled={isRegistering}>
                {isRegistering ? (
                  <FormattedMessage defaultMessage="Registering..." id="Passkeys / Registering" />
                ) : (
                  <>
                    <Fingerprint className="mr-2 h-4 w-4" />
                    <FormattedMessage defaultMessage="Register" id="Passkeys / Register" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {passkeys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Fingerprint className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              <FormattedMessage defaultMessage="No passkeys registered" id="Passkeys / No passkeys title" />
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              <FormattedMessage
                defaultMessage="Passkeys provide a more secure and convenient way to sign in using your device's biometrics or a security key."
                id="Passkeys / No passkeys description"
              />
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Fingerprint className="mr-2 h-4 w-4" />
              <FormattedMessage defaultMessage="Register Your First Passkey" id="Passkeys / Register first" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {passkeys.map((passkey: Passkey) => (
            <Card key={passkey.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
                      {getAuthenticatorIcon(passkey.authenticatorType, passkey.transports)}
                    </div>
                    <div>
                      {editingPasskey === passkey.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8 w-48"
                            autoFocus
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRename(passkey.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <CardTitle className="text-lg flex items-center gap-2">
                          {passkey.name}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => {
                              setEditingPasskey(passkey.id);
                              setEditName(passkey.name);
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </CardTitle>
                      )}
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">
                          {passkey.authenticatorType === 'platform' ? (
                            <FormattedMessage defaultMessage="Built-in" id="Passkeys / Type platform" />
                          ) : (
                            <FormattedMessage defaultMessage="Security key" id="Passkeys / Type cross-platform" />
                          )}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                  <ConfirmDialog
                    onContinue={() => handleDelete(passkey.id)}
                    variant="destructive"
                    title={
                      <FormattedMessage
                        defaultMessage="Remove passkey?"
                        id="Passkeys / Delete confirm title"
                      />
                    }
                    description={
                      <FormattedMessage
                        defaultMessage="You will no longer be able to sign in with this passkey."
                        id="Passkeys / Delete confirm description"
                      />
                    }
                  >
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </ConfirmDialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">
                      <FormattedMessage defaultMessage="Created" id="Passkeys / Created label" />
                    </p>
                    <p className="font-medium">
                      {new Date(passkey.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      <FormattedMessage defaultMessage="Last used" id="Passkeys / Last used label" />
                    </p>
                    <p className="font-medium">
                      {passkey.lastUsedAt
                        ? new Date(passkey.lastUsedAt).toLocaleDateString()
                        : intl.formatMessage({ defaultMessage: 'Never', id: 'Common / Never' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      <FormattedMessage defaultMessage="Times used" id="Passkeys / Use count label" />
                    </p>
                    <p className="font-medium">{passkey.useCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

