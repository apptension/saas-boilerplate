import React from 'react';
import { useParams } from 'react-router-dom';

import { Container } from './paymentSuccess.styles';

export interface PaymentSuccessParams {
  paymentIntentId: string;
}

export const PaymentSuccess = () => {
  const { paymentIntentId } = useParams<PaymentSuccessParams>();

  return (
    <Container>
      <h1>PaymentSuccess component {paymentIntentId}</h1>
    </Container>
  );
};
