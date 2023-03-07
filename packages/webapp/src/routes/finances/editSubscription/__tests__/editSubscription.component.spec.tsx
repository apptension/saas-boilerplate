import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { Route, Routes } from 'react-router-dom';

import {
  fillSubscriptionPlansAllQuery,
  fillSubscriptionScheduleQueryWithPhases,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '../../../../mocks/factories';
import { SubscriptionPlanName } from '../../../../shared/services/api/subscription/types';
import { composeMockedQueryResult } from '../../../../tests/utils/fixtures';
import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { ActiveSubscriptionContext } from '../../activeSubscriptionContext/activeSubscriptionContext.component';
import { EditSubscription } from '../editSubscription.component';
import { subscriptionChangeActiveMutation } from '../editSubscription.graphql';

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

      const routerProps = createMockRouterProps(['home']);
      render(<Component />, {
        routerProps,
        apolloMocks: (defaultMock) => defaultMock.concat(requestMock, requestMockMutation, requestPlansMock),
      });

      await userEvent.click(await screen.findByText(/monthly/i));

      const monthlyButton = screen.getAllByRole('button', { name: /select/i })[0];
      expect(monthlyButton).not.toBeDisabled();

      await userEvent.click(monthlyButton);
      expect(monthlyButton).toBeDisabled();

      const message = await screen.findByTestId('snackbar-message-1');
      expect(message).toHaveTextContent('Plan changed successfully');

      expect(screen.getByText(placeholder)).toBeInTheDocument();
    });
  });

  describe('plan fails to update', () => {
    it('should show error message', async () => {
      const requestMock = fillCurrentSubscriptionQuery();
      const errorMessage = 'Missing payment method';
      const requestPlansMock = fillSubscriptionPlansAllQuery([mockMonthlyPlan]);
      const requestMockMutation = fillChangeSubscriptionMutation([new GraphQLError(errorMessage)]);

      const routerProps = createMockRouterProps(['home']);
      render(<Component />, {
        routerProps,
        apolloMocks: (defaultMock) => defaultMock.concat(requestMock, requestMockMutation, requestPlansMock),
      });

      await userEvent.click(await screen.findByText(/monthly/i));
      await userEvent.click(screen.getAllByRole('button', { name: /select/i })[0]);

      const message = await screen.findByTestId('snackbar-message-1');
      expect(message).toHaveTextContent('You need first to add a payment method. Go back and set it there');
    });
  });
});
