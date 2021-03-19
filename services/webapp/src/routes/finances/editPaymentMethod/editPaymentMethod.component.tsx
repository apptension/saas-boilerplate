import React from 'react';
import { useIntl } from 'react-intl';
import { Elements } from '@stripe/react-stripe-js';

import { useHistory } from 'react-router-dom';
import { stripePromise } from '../../../shared/services/stripe';
import { useSnackbar } from '../../../shared/components/snackbar';
import { useLocaleUrl } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../app.constants';
import { Container } from './editPaymentMethod.styles';
import { EditPaymentMethodForm } from './editPaymentMethodForm';

export const EditPaymentMethod = () => {
  const intl = useIntl();
  const { showMessage } = useSnackbar();
  const history = useHistory();
  const successUrl = useLocaleUrl(ROUTES.subscriptions.index);

  const successMessage = intl.formatMessage({
    defaultMessage: 'Payment method changed successfully',
    description: 'Stripe payment / payment successful',
  });

  return (
    <Container>
      <Elements stripe={stripePromise}>
        <EditPaymentMethodForm
          onSuccess={() => {
            history.push(successUrl);
            showMessage(successMessage);
          }}
        />
      </Elements>
    </Container>
  );
};
