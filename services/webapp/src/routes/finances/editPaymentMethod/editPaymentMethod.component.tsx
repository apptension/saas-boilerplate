import { useIntl } from 'react-intl';
import { Elements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { stripePromise } from '../../../shared/services/stripe';
import { useSnackbar } from '../../../shared/components/snackbar';
import { RoutesConfig } from '../../../app/config/routes';
import { BackButton } from '../../../shared/components/backButton';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';
import { Container } from './editPaymentMethod.styles';
import { EditPaymentMethodForm } from './editPaymentMethodForm';

export const EditPaymentMethod = () => {
  const intl = useIntl();
  const { showMessage } = useSnackbar();
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();

  const successMessage = intl.formatMessage({
    defaultMessage: 'Payment method changed successfully',
    description: 'Stripe payment / payment successful',
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
