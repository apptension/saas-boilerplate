import { useIntl } from 'react-intl';
import { Elements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { stripePromise } from '../../../shared/services/stripe';
import { RoutesConfig } from '../../../app/config/routes';
import { BackButton } from '../../../shared/components/backButton';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';
import { useSnackbar } from '../../../modules/snackbar';
import { Container } from './editPaymentMethod.styles';
import { EditPaymentMethodForm } from './editPaymentMethodForm/editPaymentMethodForm.component';

export const EditPaymentMethod = () => {
  const intl = useIntl();
  const { showMessage } = useSnackbar();
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();

  const successMessage = intl.formatMessage({
    defaultMessage: 'Payment method changed successfully',
    id: 'Stripe edit payment method / successful message',
  });

  return (
    <Container>
      <BackButton />
      <Elements stripe={stripePromise}>
        <EditPaymentMethodForm
          onSuccess={() => {
            navigate(generateLocalePath(RoutesConfig.subscriptions.index));
            showMessage(successMessage);
          }}
        />
      </Elements>
    </Container>
  );
};
