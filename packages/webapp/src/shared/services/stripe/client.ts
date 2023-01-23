import { loadStripe } from '@stripe/stripe-js';
import { ENV } from '../../../app/config/env';

export const stripePromise = loadStripe(ENV.STRIPE_PUBLISHABLE_KEY);
