import { RoutesConfig as CoreRoutesConfig } from '@sb/webapp-core/config/routes';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { useSnackbar } from '@sb/webapp-core/snackbar';
import { Elements } from '@stripe/react-stripe-js';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { StripePaymentForm } from '../../components/stripe';
import { stripePromise } from '../../services/stripe';
import { Container, Header, Subheader } from './paymentConfirm.styles';

export const PaymentConfirm = () => {
  const intl = useIntl();
  const { showMessage } = useSnackbar();
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();

  const successMessage = intl.formatMessage({
    defaultMessage: 'Payment successful',
    id: 'Stripe payment confirm / payment successful',
  });

  return (
    <Container>
      <Header>
        <FormattedMessage defaultMessage="Payments" id="Finances / Stripe / Payment confirm / heading" />
      </Header>

      <Subheader>
        <FormattedMessage defaultMessage="Donate" id="Finances / Stripe / Payment confirm / subheading" />
      </Subheader>

      <Elements stripe={stripePromise}>
        <StripePaymentForm
          onSuccess={() => {
            navigate(generateLocalePath(CoreRoutesConfig.home));
            showMessage(successMessage);
          }}
        />
      </Elements>
    </Container>
  );
};
