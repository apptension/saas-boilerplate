import { useMutation } from '@apollo/client';
import { Modal } from '@sb/webapp-core/components/modal';
import { useSnackbar } from '@sb/webapp-core/snackbar';
import { H5 } from '@sb/webapp-core/theme/typography';
import { FormattedMessage, useIntl } from 'react-intl';

import { useCommonQuery } from '../../../../app/providers/commonQuery';
import { useOpenState } from '../../../hooks';
import { AddTwoFactorAuth } from '../addTwoFactorAuth';
import { disableOtpMutation } from './twoFactorAuthForm.graphql';
import { Container, CtaButton, Row } from './twoFactorAuthForm.styles';

export type TwoFactorAuthFormProps = {
  isEnabled?: boolean;
};

export const TwoFactorAuthForm = ({ isEnabled }: TwoFactorAuthFormProps) => {
  const { isOpen: isModalOpen, setIsOpen: setIsModalOpen } = useOpenState(false); //temporary - waiting for modal
  const [commitDisableOtpMutation] = useMutation(disableOtpMutation, { variables: { input: {} } });
  const { reload } = useCommonQuery();
  const intl = useIntl();
  const { showMessage } = useSnackbar();

  const successMessage = intl.formatMessage({
    id: 'Auth / Two-factor / Disable success',
    defaultMessage: '🎉 Two-Factor Auth Disabled Successfully!',
  });
  const modalHeader = intl.formatMessage({
    id: 'Auth / Two-factor / Modal header',
    defaultMessage: 'Two-Factor Authentication (2FA)',
  });

  const disable2FA = async () => {
    const { data } = await commitDisableOtpMutation();

    const isDeleted = data?.disableOtp?.ok;
    if (!isDeleted) return;

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
          <CtaButton onClick={() => disable2FA()}>
            <FormattedMessage defaultMessage="Disable 2FA" id="Auth / Two-factor / Disable button" />
          </CtaButton>
        </Row>
      ) : (
        <Row>
          <H5>
            <FormattedMessage
              defaultMessage="Your account is not using two-factor authentication"
              id="Auth / Two-factor / Not using two-factor auth"
            />
          </H5>
          <CtaButton onClick={() => setIsModalOpen(true)}>
            <FormattedMessage defaultMessage="Setup 2FA" id="Auth / Two-factor / Setup button" />
          </CtaButton>
        </Row>
      )}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} header={modalHeader}>
        <AddTwoFactorAuth closeModal={() => setIsModalOpen(false)} />
      </Modal>
    </Container>
  );
};
