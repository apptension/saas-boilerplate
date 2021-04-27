import React from 'react';
import userEvent from '@testing-library/user-event';
import { waitFor, screen } from '@testing-library/react';
import { makeContextRenderer, spiedHistory } from '../../../../shared/utils/testUtils';
import { CancelSubscription } from '../cancelSubscription.component';
import { prepareState } from '../../../../mocks/store';
import { subscriptionFactory, subscriptionPhaseFactory } from '../../../../mocks/factories';
import { SubscriptionPlanName } from '../../../../shared/services/api/subscription/types';
import { subscriptionActions } from '../../../../modules/subscription';
import { snackbarActions } from '../../../../modules/snackbar';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

const store = prepareState((state) => {
  state.subscription.activeSubscription = subscriptionFactory({
    phases: [
      subscriptionPhaseFactory({
        endDate: '2020-10-10',
        item: {
          price: {
            product: {
              name: SubscriptionPlanName.MONTHLY,
            },
          },
        },
      }),
      subscriptionPhaseFactory({ startDate: '2020-10-10' }),
    ],
  });
});

describe('CancelSubscription: Component', () => {
  const component = () => <CancelSubscription />;
  const render = makeContextRenderer(component);

  beforeEach(() => {
    mockDispatch.mockReset();
  });

  it('should render current plan details', () => {
    render({}, { store });
    expect(screen.getByText(/active plan.+monthly/gi)).toBeInTheDocument();
    expect(screen.getByText(/next renewal.+2020-10-10/gi)).toBeInTheDocument();
  });

  describe('cancel button is clicked', () => {
    it('should trigger cancelSubscription action', () => {
      render();
      userEvent.click(screen.getByText(/cancel subscription/i));
      expect(mockDispatch).toHaveBeenCalledWith(subscriptionActions.cancelSubscription());
    });
  });

  describe('cancel completes successfully', () => {
    it('should show success message and redirect to subscriptions page', async () => {
      const { history, pushSpy } = spiedHistory();
      render({}, { store, router: { history } });
      userEvent.click(screen.getByText(/cancel subscription/i));
      await waitFor(() => {
        expect(pushSpy).toHaveBeenCalledWith('/en/subscriptions');
        expect(mockDispatch).toHaveBeenCalledWith(
          snackbarActions.showMessage('You will be moved to free plan with the next billing period')
        );
      });
    });
  });

  describe('cancel completes with error', () => {
    it('shouldnt show success message and redirect to subscriptions page', async () => {
      const { history, pushSpy } = spiedHistory();
      mockDispatch.mockImplementation((action) => {
        if (action.type.startsWith(subscriptionActions.cancelSubscription.type)) {
          return Promise.reject(null);
        }
      });

      render({}, { store, router: { history } });
      userEvent.click(screen.getByText(/cancel subscription/i));
      await waitFor(() => {
        expect(pushSpy).not.toHaveBeenCalledWith('/en/subscriptions');
        expect(mockDispatch).not.toHaveBeenCalledWith(
          snackbarActions.showMessage('You will be moved to free plan with the next billing period')
        );
      });
    });
  });
});
