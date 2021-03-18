import { actionCreator } from '../helpers/actionCreator';
import { FetchSubscriptionSuccessPayload } from './subscription.types';

const { createPromiseAction } = actionCreator('SUBSCRIPTION');

export const fetchActiveSubscription = createPromiseAction<void, FetchSubscriptionSuccessPayload>('FETCH_ACTIVE');
