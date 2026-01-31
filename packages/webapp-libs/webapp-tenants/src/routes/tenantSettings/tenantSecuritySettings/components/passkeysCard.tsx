import { apiClient, apiURL } from '@sb/webapp-api-client/api';
import { Button } from '@sb/webapp-core/components/buttons';
import { Input } from '@sb/webapp-core/components/forms';
import { Badge } from '@sb/webapp-core/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@sb/webapp-core/components/ui/dialog';
import { useOpenState } from '@sb/webapp-core/hooks';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { Fingerprint, Key, Loader2, Plus, Search, Trash2, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { useCurrentTenant } from '../../../../providers';
import { AddPasskeyModal } from './addPasskeyModal';

type Passkey = {
  id: string;
  name: string;
  authenticatorType: string;
  createdAt: string;
  lastUsedAt: string | null;
  useCount: number;
  userEmail?: string;
  userName?: string;
};

export type PasskeysCardProps = {
  canManagePasskeys?: boolean;
};

export const PasskeysCard = ({ canManagePasskeys = false }: PasskeysCardProps) => {
  const { isOpen: isModalOpen, setIsOpen: setIsModalOpen } = useOpenState(false);
  const { toast } = useToast();
  const intl = useIntl();
  const { data: currentTenant } = useCurrentTenant();
  const tenantId = currentTenant?.id;

  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [filteredPasskeys, setFilteredPasskeys] = useState<Passkey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPasskeys = useCallback(async () => {
    if (!tenantId) {
      setIsLoading(false);
      return;
    }

    try {
      // If user can manage SSO (owner/admin), fetch all tenant passkeys
      // Otherwise, fetch only their own passkeys
      // Use apiURL helper to construct full URL with correct base
      const endpoint = canManagePasskeys
        ? apiURL(`/sso/tenant/${tenantId}/passkeys/`)
        : apiURL('/sso/passkeys/');

      const response = await apiClient.get(endpoint);
      const data = Array.isArray(response.data) ? response.data : [];
      setPasskeys(data);
      setFilteredPasskeys(data);
    } catch (error: unknown) {
      // Silently handle errors - passkeys feature may not be available
      // This prevents console noise when the backend SSO app is not configured
      if (process.env['NODE_ENV'] === 'development') {
        console.warn('Passkeys fetch failed (this is expected if SSO is not configured):', error);
      }
      setPasskeys([]);
      setFilteredPasskeys([]);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, canManagePasskeys]);

  useEffect(() => {
    fetchPasskeys();
  }, [fetchPasskeys]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPasskeys(passkeys);
      return;
    }

    const query = searchQuery.toLowerCase();
    setFilteredPasskeys(
      passkeys.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.userEmail?.toLowerCase().includes(query) ||
          p.userName?.toLowerCase().includes(query)
      )
    );
  }, [searchQuery, passkeys]);

  const handleDelete = async (passkeyId: string) => {
    setDeletingId(passkeyId);
    try {
      // Use tenant endpoint for admin deletion, user endpoint for self deletion
      // Use apiURL helper to construct full URL with correct base
      const endpoint = canManagePasskeys
        ? apiURL(`/sso/tenant/${tenantId}/passkeys/${passkeyId}`)
        : apiURL(`/sso/passkeys/${passkeyId}`);

      await apiClient.delete(endpoint);

      setPasskeys((prev) => prev.filter((p) => p.id !== passkeyId));
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Passkey deleted successfully.',
          id: 'Passkeys Card / Delete Success',
        }),
        variant: 'success',
      });
    } catch (error) {
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Failed to delete passkey. Please try again.',
          id: 'Passkeys Card / Delete Error',
        }),
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleRegistrationSuccess = () => {
    fetchPasskeys();
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dateStr));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                <FormattedMessage
                  defaultMessage="Passkeys (WebAuthn)"
                  id="Tenant Security Settings / Passkeys Header"
                />
                {passkeys.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {passkeys.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {canManagePasskeys ? (
                  <FormattedMessage
                    defaultMessage="Manage passkeys for all users in your organization"
                    id="Tenant Security Settings / Passkeys Admin Description"
                  />
                ) : (
                  <FormattedMessage
                    defaultMessage="Use biometrics or security keys for passwordless authentication"
                    id="Tenant Security Settings / Passkeys Description"
                  />
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input - only show for admins with passkeys */}
          {canManagePasskeys && passkeys.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={intl.formatMessage({
                  defaultMessage: 'Search by user name or email...',
                  id: 'Passkeys Card / Search Placeholder',
                })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPasskeys.length === 0 ? (
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-muted p-2">
                  <Key className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {searchQuery ? (
                      <FormattedMessage
                        defaultMessage="No passkeys match your search"
                        id="Tenant Security Settings / No Passkeys Match"
                      />
                    ) : (
                      <FormattedMessage
                        defaultMessage="No passkeys registered"
                        id="Tenant Security Settings / No Passkeys"
                      />
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? (
                      <FormattedMessage
                        defaultMessage="Try a different search term"
                        id="Tenant Security Settings / No Match Hint"
                      />
                    ) : canManagePasskeys ? (
                      <FormattedMessage
                        defaultMessage="No users in your organization have registered passkeys yet"
                        id="Tenant Security Settings / Passkey Admin Hint"
                      />
                    ) : (
                      <FormattedMessage
                        defaultMessage="Register a passkey for faster, more secure sign-in"
                        id="Tenant Security Settings / Passkey Hint"
                      />
                    )}
                  </p>
                </div>
              </div>
              {!canManagePasskeys && (
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  <FormattedMessage
                    defaultMessage="Add Passkey"
                    id="Tenant Security Settings / Add Passkey Button"
                  />
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPasskeys.map((passkey) => (
                <div
                  key={passkey.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Fingerprint className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{passkey.name}</p>
                        {passkey.authenticatorType === 'platform' && (
                          <Badge variant="outline" className="text-xs">
                            <FormattedMessage defaultMessage="Device" id="Passkeys / Device Badge" />
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {/* Show user info for admin view */}
                        {canManagePasskeys && passkey.userEmail && (
                          <>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {passkey.userName || passkey.userEmail}
                            </span>
                            <span>•</span>
                          </>
                        )}
                        <span>
                          <FormattedMessage
                            defaultMessage="Added {date}"
                            id="Passkeys Card / Added Date"
                            values={{ date: formatDate(passkey.createdAt) }}
                          />
                        </span>
                        {passkey.lastUsedAt && (
                          <>
                            <span>•</span>
                            <span>
                              <FormattedMessage
                                defaultMessage="Last used {date}"
                                id="Passkeys Card / Last Used"
                                values={{ date: formatDate(passkey.lastUsedAt) }}
                              />
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(passkey.id)}
                    disabled={deletingId === passkey.id}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    {deletingId === passkey.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}

              {!canManagePasskeys && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <FormattedMessage
                    defaultMessage="Add another passkey"
                    id="Passkeys Card / Add Another Button"
                  />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
          <AddPasskeyModal closeModal={() => setIsModalOpen(false)} onSuccess={handleRegistrationSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
};
