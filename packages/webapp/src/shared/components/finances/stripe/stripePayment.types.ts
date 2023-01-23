import { PayloadError } from 'relay-runtime';
import { stripeCreatePaymentIntentMutation$data } from '../../../../modules/stripe/__generated__/stripeCreatePaymentIntentMutation.graphql';
import { stripePaymentIntentFragment$data } from '../../../../modules/stripe/__generated__/stripePaymentIntentFragment.graphql';
import { stripeUpdatePaymentIntentMutation$data } from '../../../../modules/stripe/__generated__/stripeUpdatePaymentIntentMutation.graphql';

export type UpdateOrCreatePaymentIntentResult = {
  response: stripeCreatePaymentIntentMutation$data | stripeUpdatePaymentIntentMutation$data;
  errors: PayloadError[] | null;
  paymentIntent?: stripePaymentIntentFragment$data;
};
