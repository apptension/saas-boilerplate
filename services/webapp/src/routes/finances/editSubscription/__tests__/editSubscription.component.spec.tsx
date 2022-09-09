import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { OperationDescriptor } from 'react-relay/hooks';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { connectionFromArray, packHistoryArgs, spiedHistory } from '../../../../shared/utils/testUtils';
import { render } from '../../../../tests/utils/rendering';
import { EditSubscription } from '../editSubscription.component';
import { subscriptionFactory, subscriptionPhaseFactory, subscriptionPlanFactory } from '../../../../mocks/factories';
import { SubscriptionPlanName } from '../../../../shared/services/api/subscription/types';
import { subscriptionActions } from '../../../../modules/subscription';
import { snackbarActions } from '../../../../modules/snackbar';
import { fillCommonQueryWithUser } from '../../../../shared/utils/commonQuery';
import subscriptionPlansAllQueryGraphql from '../../../../modules/subscription/__generated__/subscriptionPlansAllQuery.graphql';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

const mockMonthlyPlan = subscriptionPlanFactory({
  id: 'plan_monthly',
  pk: 'plan_monthly',
  product: { name: SubscriptionPlanName.MONTHLY },
});
const mockYearlyPlan = subscriptionPlanFactory({ id: 'plan_yearly', product: { name: SubscriptionPlanName.YEARLY } });

const userSubscription = subscriptionFactory({
  phases: [subscriptionPhaseFactory({ item: { price: mockMonthlyPlan } })],
});

const getRelayEnv = () => {
  const relayEnvironment = createMockEnvironment();
  fillCommonQueryWithUser(relayEnvironment);
  relayEnvironment.mock.queueOperationResolver((operation: OperationDescriptor) =>
    MockPayloadGenerator.generate(operation, {
      SubscriptionPlanConnection: () => connectionFromArray([mockMonthlyPlan, mockYearlyPlan]),
    })
  );
  relayEnvironment.mock.queuePendingOperation(subscriptionPlansAllQueryGraphql, {});
  return relayEnvironment;
};

describe('EditSubscription: Component', () => {
  beforeEach(() => {
    mockDispatch.mockReset();
  });

  describe('plan is changed sucessfully', () => {
    it('should show success message and redirect to my subscription page', async () => {
      mockDispatch.mockResolvedValue({ isError: false, ...userSubscription });

      const { history, pushSpy } = spiedHistory();
      const relayEnvironment = getRelayEnv();
      render(<EditSubscription />, { relayEnvironment, routerHistory: history });

      await userEvent.click(screen.getByText(/monthly/i));
      await userEvent.click(screen.getAllByRole('button', { name: /select/i })[0]);

      expect(mockDispatch).toHaveBeenCalledWith(subscriptionActions.updateSubscriptionPlan({ price: 'plan_monthly' }));
      expect(mockDispatch).toHaveBeenCalledWith(snackbarActions.showMessage('Plan changed successfully'));
      expect(pushSpy).toHaveBeenCalledWith(...packHistoryArgs('/en/subscriptions'));
    });
  });

  describe('plan fails to update', () => {
    it('should show error message', async () => {
      mockDispatch.mockResolvedValue({
        isError: true,
        nonFieldErrors: [{ code: 'error_code', message: 'error message' }],
      });
      const relayEnvironment = getRelayEnv();

      render(<EditSubscription />, { relayEnvironment });

      await userEvent.click(screen.getByText(/monthly/i));
      await userEvent.click(screen.getAllByRole('button', { name: /select/i })[0]);

      expect(mockDispatch).toHaveBeenCalledWith(
        snackbarActions.showMessage('You need first to add a payment method. Go back and set it there')
      );
    });
  });
});
