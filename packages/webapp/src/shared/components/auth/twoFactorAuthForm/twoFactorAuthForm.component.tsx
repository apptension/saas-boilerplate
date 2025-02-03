import { useMutation } from '@apollo/client';
import { useCommonQuery } from '@sb/webapp-api-client/providers';
import { Button } from '@sb/webapp-core/components/buttons';
import { Dialog, DialogContent } from '@sb/webapp-core/components/ui/dialog';
import { useOpenState } from '@sb/webapp-core/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { reportError } from '@sb/webapp-core/utils/reportError';
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
    defaultMessage: '🎉 Two-Factor Auth Disabled Successfully!',
  });

  const disable2FA = async () => {
    const { data } = await commitDisableOtpMutation();

    const isDeleted = data?.disableOtp?.ok;
    if (!isDeleted) return;

    trackEvent('auth', 'otp-disabled');
    toast({ description: successMessage });
    reload();
  };

  return (
    <div>
      {isEnabled ? (
        <div className="flex flex-col items-start gap-y-1">
          <FormattedMessage
            defaultMessage="Your account is using two-factor authentication"
            id="Auth / Two-factor / Using two-factor auth"
          />
          <Button
            type="submit"
            className="mt-1"
            onClick={() => {
              disable2FA().catch(reportError);
            }}
          >
            <FormattedMessage defaultMessage="Disable 2FA" id="Auth / Two-factor / Disable button" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-y-1">
          <FormattedMessage
            defaultMessage="Your account is not using two-factor authentication"
            id="Auth / Two-factor / Not using two-factor auth"
          />
          <Button type="submit" className="mt-1" onClick={() => setIsModalOpen(true)}>
            <FormattedMessage defaultMessage="Setup 2FA" id="Auth / Two-factor / Setup button" />
          </Button>
        </div>
      )}

      <Dialog
        open={isModalOpen}
        onOpenChange={(e) => {
          setIsModalOpen(e);
        }}
      >
        <DialogContent>
          <AddTwoFactorAuth closeModal={() => setIsModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
