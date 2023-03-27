import { ENV } from '@sb/webapp-core/config/env';
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(ENV.STRIPE_PUBLISHABLE_KEY);
