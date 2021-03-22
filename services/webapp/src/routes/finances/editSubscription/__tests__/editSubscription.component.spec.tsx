import React from 'react';

import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { makeContextRenderer, spiedHistory } from '../../../../shared/utils/testUtils';
import { EditSubscription } from '../editSubscription.component';
import { prepareState } from '../../../../mocks/store';
import { subscriptionFactory, subscriptionPlanFactory } from '../../../../mocks/factories';
import { SubscriptionPlanName } from '../../../../shared/services/api/subscription/types';
import { subscriptionActions } from '../../../../modules/subscription';
import { server } from '../../../../mocks/server';
import { snackbarActions } from '../../../../modules/snackbar';
import { mockUpdateSubscription } from '../../../../mocks/server/handlers/subscription';
import { useAvailableSubscriptionPlans } from '../editSubscription.hooks';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

const mockMonthlyPlan = subscriptionPlanFactory({
  id: 'plan_monthly',
  product: { name: SubscriptionPlanName.MONTHLY },
});
const mockYearlyPlan = subscriptionPlanFactory({ id: 'plan_yearly', product: { name: SubscriptionPlanName.YEARLY } });

jest.mock('../editSubscription.hooks', () => ({
  useAvailableSubscriptionPlans: () => ({ plans: [mockMonthlyPlan, mockYearlyPlan], isLoading: false }),
}));

const userSubscription = subscriptionFactory({ item: { price: mockMonthlyPlan } });

describe('EditSubscription: Component', () => {
  const component = () => <EditSubscription />;
  const render = makeContextRenderer(component);

  beforeEach(() => {
    mockDispatch.mockReset();
  });

  describe('plan is changed sucessfully', () => {
    it('should show success message and redirect to my subscription page', async () => {
      mockDispatch.mockResolvedValue({ isError: false, ...userSubscription });

      const { history, pushSpy } = spiedHistory();
      render({}, { router: { history } });

      userEvent.click(screen.getByText(/monthly/gi));
      userEvent.click(screen.getByRole('button', { name: /change plan/gi }));

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          subscriptionActions.updateSubscriptionPlan({ price: 'plan_monthly' })
        );
        expect(mockDispatch).toHaveBeenCalledWith(snackbarActions.showMessage('Plan changed successfully'));
        expect(pushSpy).toHaveBeenCalledWith('/en/subscriptions');
      });
    });
  });

  describe('plan fails to update', () => {
    it('should show error message', async () => {
      mockDispatch.mockResolvedValue({
        isError: true,
        nonFieldErrors: [{ code: 'error_code', message: 'error message' }],
      });

      render({});

      userEvent.click(screen.getByText(/monthly/gi));
      userEvent.click(screen.getByRole('button', { name: /change plan/gi }));

      await waitFor(() => {
        expect(screen.getByText('error message'));
      });
    });
  });

  describe('user is eligible to start trial', () => {
    it('should show trial info', () => {
      const store = prepareState((state) => {
        state.subscription.activeSubscription = subscriptionFactory({ canActivateTrial: true });
      });

      render({}, { store });

      expect(screen.getByText(/your plan will start with a trial/gi)).toBeInTheDocument();
    });
  });

  describe('user is illegible to start trial', () => {
    it('should not show trial info', () => {
      const store = prepareState((state) => {
        state.subscription.activeSubscription = subscriptionFactory({ canActivateTrial: false });
      });

      render({}, { store });
      expect(screen.queryByText(/your plan will start with a trial/gi)).not.toBeInTheDocument();
    });
  });
});
