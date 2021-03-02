import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Elements } from '@stripe/react-stripe-js';
import { useHistory } from 'react-router-dom';
import { generatePath } from 'react-router';

import { H1 } from '../../../theme/typography';
import { stripePromise } from '../../../shared/services/stripe';
import { StripePaymentForm } from '../../../shared/components/finances/stripe';
import { ROUTES } from '../../app.constants';
import { Container } from './paymentConfirm.styles';

export const PaymentConfirm = () => {
  const history = useHistory();

  return (
    <Container>
      <H1>
        <FormattedMessage
          defaultMessage="Payment confirm"
          description="Finances / Stripe / Payment confirm / heading"
        />
      </H1>

      <Elements stripe={stripePromise}>
        <StripePaymentForm
          onSuccess={(paymentIntent) => {
            history.push(generatePath(ROUTES.finances.paymentSuccess, { paymentIntentId: paymentIntent.id }));
          }}
        />
      </Elements>
    </Container>
  );
};
