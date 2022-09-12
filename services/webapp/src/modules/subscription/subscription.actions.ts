import { actionCreator } from '../helpers/actionCreator';

const { createPromiseAction } = actionCreator('SUBSCRIPTION');

export const cancelSubscription = createPromiseAction<void, void>('CANCEL_SUBSCRIPTION');
