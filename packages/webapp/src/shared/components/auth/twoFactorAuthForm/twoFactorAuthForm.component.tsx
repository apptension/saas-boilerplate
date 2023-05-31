import { useMutation } from '@apollo/client';
import { useCommonQuery } from '@sb/webapp-api-client/providers';
import { Button } from '@sb/webapp-core/components/buttons';
import { Modal } from '@sb/webapp-core/components/modal';
import { useOpenState } from '@sb/webapp-core/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useSnackbar } from '@sb/webapp-core/snackbar';
import { H5 } from '@sb/webapp-core/theme/typography';
import { FormattedMessage, useIntl } from 'react-intl';

import { AddTwoFactorAuth } from '../addTwoFactorAuth';
import { disableOtpMutation } from './twoFactorAuthForm.graphql';
import { Container, ModalHeader, Row } from './twoFactorAuthForm.styles';

export type TwoFactorAuthFormProps = {
  isEnabled?: boolean;
};

export const TwoFactorAuthForm = ({ isEnabled }: TwoFactorAuthFormProps) => {
  const { isOpen: isModalOpen, setIsOpen: setIsModalOpen } = useOpenState(false);
  const [commitDisableOtpMutation] = useMutation(disableOtpMutation, { variables: { input: {} } });
  const { reload } = useCommonQuery();
  const intl = useIntl();
  const { showMessage } = useSnackbar();

  const successMessage = intl.formatMessage({
    id: 'Auth / Two-factor / Disable success',
    defaultMessage: '🎉 Two-Factor Auth Disabled Successfully!',
  });

  const disable2FA = async () => {
    const { data } = await commitDisableOtpMutation();

    const isDeleted = data?.disableOtp?.ok;
    if (!isDeleted) return;

    trackEvent('auth', 'otp-disabled');
    showMessage(successMessage);
    reload();
  };

  return (
    <Container>
      {isEnabled ? (
        <Row>
          <H5>
            <FormattedMessage
              defaultMessage="Your account is using two-factor authentication"
              id="Auth / Two-factor / Using two-factor auth"
            />
          </H5>
          <Button type="submit" onClick={() => disable2FA()} className="mt-2">
            <FormattedMessage defaultMessage="Disable 2FA" id="Auth / Two-factor / Disable button" />
          </Button>
        </Row>
      ) : (
        <Row>
          <H5>
            <FormattedMessage
              defaultMessage="Your account is not using two-factor authentication"
              id="Auth / Two-factor / Not using two-factor auth"
            />
          </H5>
          <Button type="submit" onClick={() => setIsModalOpen(true)} className="mt-2">
            <FormattedMessage defaultMessage="Setup 2FA" id="Auth / Two-factor / Setup button" />
          </Button>
        </Row>
      )}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        header={
          <ModalHeader>
            <FormattedMessage defaultMessage="Two-Factor Authentication (2FA)" id="Auth / Two-factor / Modal header" />
          </ModalHeader>
        }
      >
        <AddTwoFactorAuth closeModal={() => setIsModalOpen(false)} />
      </Modal>
    </Container>
  );
};
