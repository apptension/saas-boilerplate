import { useMutation } from '@apollo/client/react';
import { useCommonQuery } from '@sb/webapp-api-client/providers';
import { Button } from '@sb/webapp-core/components/buttons';
import { ConfirmDialog } from '@sb/webapp-core/components/confirmDialog';
import { Badge } from '@sb/webapp-core/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@sb/webapp-core/components/ui/dialog';
import { useOpenState } from '@sb/webapp-core/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { reportError } from '@sb/webapp-core/utils/reportError';
import { CheckCircle2, Plus, Shield, ShieldOff } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';

import { AddTwoFactorAuth } from '../addTwoFactorAuth';
import { disableOtpMutation } from './twoFactorAuthForm.graphql';

export type TwoFactorAuthFormProps = {
  isEnabled?: boolean;
};

export const TwoFactorAuthForm = ({ isEnabled }: TwoFactorAuthFormProps) => {
  const intl = useIntl();
  const { toast } = useToast();
  const { reload } = useCommonQuery();

  const { isOpen: isModalOpen, setIsOpen: setIsModalOpen } = useOpenState(false);
  const [commitDisableOtpMutation] = useMutation(disableOtpMutation, { variables: { input: {} } });

  const successMessage = intl.formatMessage({
    id: 'Auth / Two-factor / Disable success',
    defaultMessage: 'Two-Factor Auth disabled successfully!',
  });

  const disable2FA = async () => {
    const { data } = await commitDisableOtpMutation();

    const isDeleted = data?.disableOtp?.ok;
    if (!isDeleted) return;

    trackEvent('auth', 'otp-disabled');
    toast({ description: successMessage, variant: 'info' });
    reload();
  };

  return (
    <>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          <FormattedMessage
            defaultMessage="Add an extra layer of security to your account by requiring a verification code in addition to your password."
            id="Auth / Two-factor / Description"
          />
        </p>

        {isEnabled ? (
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      <FormattedMessage
                        defaultMessage="Two-factor authentication"
                        id="Auth / Two-factor / Status label"
                      />
                    </p>
                    <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
                      <FormattedMessage defaultMessage="Enabled" id="Auth / Two-factor / Enabled badge" />
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <FormattedMessage
                      defaultMessage="Your account is protected with an authenticator app"
                      id="Auth / Two-factor / Protected message"
                    />
                  </p>
                </div>
              </div>
              <ConfirmDialog
                onContinue={() => {
                  disable2FA().catch(reportError);
                }}
                variant="destructive"
                title={
                  <FormattedMessage
                    defaultMessage="Disable two-factor authentication?"
                    id="Auth / Two-factor / Disable confirm title"
                  />
                }
                description={
                  <FormattedMessage
                    defaultMessage="This will remove the extra layer of security from your account. You can re-enable it at any time."
                    id="Auth / Two-factor / Disable confirm description"
                  />
                }
              >
                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <ShieldOff className="mr-2 h-4 w-4" />
                  <FormattedMessage defaultMessage="Disable" id="Auth / Two-factor / Disable button" />
                </Button>
              </ConfirmDialog>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center">
            <Shield className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="mb-1 font-medium">
              <FormattedMessage
                defaultMessage="Two-factor authentication is not enabled"
                id="Auth / Two-factor / Not enabled title"
              />
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              <FormattedMessage
                defaultMessage="Protect your account with an authenticator app like Google Authenticator or Authy."
                id="Auth / Two-factor / Not enabled description"
              />
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              <FormattedMessage defaultMessage="Enable 2FA" id="Auth / Two-factor / Setup button" />
            </Button>
          </div>
        )}
      </div>

      <Dialog
        open={isModalOpen}
        onOpenChange={(e) => {
          setIsModalOpen(e);
        }}
      >
        <DialogContent aria-describedby="two-factor-dialog-description">
          <DialogTitle className="sr-only">
            <FormattedMessage
              defaultMessage="Set Up Two-Factor Authentication"
              id="Auth / Two-factor / Dialog Title"
            />
          </DialogTitle>
          <DialogDescription id="two-factor-dialog-description" className="sr-only">
            <FormattedMessage
              defaultMessage="Secure your account with an authenticator app"
              id="Auth / Two-factor / Dialog Description"
            />
          </DialogDescription>
          <AddTwoFactorAuth closeModal={() => setIsModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};
