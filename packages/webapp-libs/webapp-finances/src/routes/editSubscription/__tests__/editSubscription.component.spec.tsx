import { SubscriptionPlanName } from '@sb/webapp-api-client/api/subscription/types';
import { subscriptionPhaseFactory, subscriptionPlanFactory } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils/fixtures';
import { RoutesConfig as CoreRoutesConfig } from '@sb/webapp-core/config/routes';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { Route, Routes } from 'react-router-dom';

import { ActiveSubscriptionContext } from '../../../components/activeSubscriptionContext';
import { fillSubscriptionPlansAllQuery, fillSubscriptionScheduleQueryWithPhases } from '../../../tests/factories';
import { createMockRouterProps, render } from '../../../tests/utils/rendering';
import { EditSubscription } from '../editSubscription.component';
import { subscriptionChangeActiveMutation } from '../editSubscription.graphql';

jest.mock('@sb/webapp-core/services/analytics');

const mockMonthlyPlan = subscriptionPlanFactory({
  id: 'plan_monthly',
  pk: 'plan_monthly',
  product: { name: SubscriptionPlanName.MONTHLY },
});
const mockYearlyPlan = subscriptionPlanFactory({ id: 'plan_yearly', product: { name: SubscriptionPlanName.YEARLY } });

const mockMutationVariables = { input: { price: 'plan_monthly' } };

const mockMutationData = {
  changeActiveSubscription: {
    subscriptionSchedule: {
      id: 'mutation-test-id',
      phases: [],
      subscription: null,
      canActivateTrial: true,
      defaultPaymentMethod: {
        id: 'payment-method-id',
      },
      __typename: 'SubscriptionScheduleType',
    },
    __typename: 'ChangeActiveSubscriptionMutationPayload',
  },
};

const phases = [
  subscriptionPhaseFactory({
    item: { price: subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } }) },
  }),
];

const fillCurrentSubscriptionQuery = () => fillSubscriptionScheduleQueryWithPhases(phases);
const fillChangeSubscriptionMutation = (errors?: GraphQLError[]) =>
  composeMockedQueryResult(subscriptionChangeActiveMutation, {
    data: mockMutationData,
    variables: mockMutationVariables,
    errors,
  });

const placeholder = 'Subscriptions placeholder';

const Component = () => {
  return (
    <Routes>
      <Route path="/en" element={<ActiveSubscriptionContext />}>
        <Route index element={<EditSubscription />} />
        <Route path="/en/subscriptions" element={<span>{placeholder}</span>} />
      </Route>
    </Routes>
  );
};

describe('EditSubscription: Component', () => {
  describe('plan is changed sucessfully', () => {
    it('should show success message and redirect to my subscription page', async () => {
      const requestMock = fillCurrentSubscriptionQuery();
      const requestPlansMock = fillSubscriptionPlansAllQuery([mockMonthlyPlan, mockYearlyPlan]);
      const requestMockMutation = fillChangeSubscriptionMutation();

      const routerProps = createMockRouterProps(CoreRoutesConfig.home);
      render(<Component />, {
        routerProps,
        apolloMocks: (defaultMock) => defaultMock.concat(requestMock, requestMockMutation, requestPlansMock),
      });

      await userEvent.click(await screen.findByText(/monthly/i));

      const monthlyButton = screen.getAllByRole('button', { name: /select/i })[0];
      expect(monthlyButton).not.toBeDisabled();

      await userEvent.click(monthlyButton);
      expect(monthlyButton).toBeDisabled();

      const toast = await screen.findByTestId('toast-1');
      expect(toast).toHaveTextContent('Plan changed successfully');

      expect(trackEvent).toHaveBeenCalledWith('subscription', 'change-plan');
      expect(screen.getByText(placeholder)).toBeInTheDocument();
    });
  });

  describe('plan fails to update', () => {
    it('should show error message', async () => {
      const requestMock = fillCurrentSubscriptionQuery();
      const errorMessage = 'Missing payment method';
      const requestPlansMock = fillSubscriptionPlansAllQuery([mockMonthlyPlan]);
      const requestMockMutation = fillChangeSubscriptionMutation([new GraphQLError(errorMessage)]);

      const routerProps = createMockRouterProps(CoreRoutesConfig.home);
      render(<Component />, {
        routerProps,
        apolloMocks: (defaultMock) => defaultMock.concat(requestMock, requestMockMutation, requestPlansMock),
      });

      await userEvent.click(await screen.findByText(/monthly/i));
      await userEvent.click(screen.getAllByRole('button', { name: /select/i })[0]);

      const toast = await screen.findByTestId('toast-1');
      expect(toast).toHaveTextContent('You need first to add a payment method. Go back and set it there');
    });
  });
});
