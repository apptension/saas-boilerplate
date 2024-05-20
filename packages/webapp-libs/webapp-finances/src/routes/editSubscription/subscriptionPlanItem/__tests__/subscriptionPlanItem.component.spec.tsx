import { useQuery } from '@apollo/client';
import { SubscriptionPlanName } from '@sb/webapp-api-client/api/subscription';
import {
  currentUserFactory,
  fillCommonQueryWithUser,
  paymentMethodFactory,
  subscriptionFactory,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '@sb/webapp-api-client/tests/factories';
import { mapConnection } from '@sb/webapp-core/utils/graphql';
import { tenantFactory } from '@sb/webapp-tenants/tests/factories/tenant';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import {
  ActiveSubscriptionContext,
  useActiveSubscriptionDetails,
} from '../../../../components/activeSubscriptionContext';
import {
  fillSubscriptionPlansAllQuery,
  fillSubscriptionScheduleQuery,
  fillSubscriptionScheduleQueryWithPhases,
} from '../../../../tests/factories';
import { render } from '../../../../tests/utils/rendering';
import { subscriptionPlansAllQuery } from '../../subscriptionPlans/subscriptionPlans.graphql';
import { SubscriptionPlanItem, SubscriptionPlanItemProps } from '../subscriptionPlanItem.component';

const defaultPaymentPlan = [paymentMethodFactory()];

const tenantId = 'tenantId';

describe('SubscriptionPlanItem: Component', () => {
  const defaultProps: Pick<SubscriptionPlanItemProps, 'onSelect'> = { onSelect: () => jest.fn() };

  const Component = (props: Partial<SubscriptionPlanItemProps>) => {
    const { activeSubscription } = useActiveSubscriptionDetails();
    const { data } = useQuery(subscriptionPlansAllQuery);

    const plans = mapConnection((plan) => plan, data?.allSubscriptionPlans);

    return (
      <SubscriptionPlanItem
        {...defaultProps}
        plan={plans[0]}
        activeSubscription={activeSubscription}
        loading={false}
        {...props}
      />
    );
  };

  const Wrapper = (props: Partial<SubscriptionPlanItemProps>) => {
    return (
      <Routes>
        <Route element={<ActiveSubscriptionContext />}>
          <Route index element={<Component {...props} />} />
        </Route>
      </Routes>
    );
  };

  const monthlyPlan = subscriptionPlanFactory({
    id: 'plan_monthly',
    pk: 'price_monthly',
    product: { name: SubscriptionPlanName.MONTHLY },
  });

  const yearlyPlan = subscriptionPlanFactory({
    id: 'plan_yearly',
    pk: 'price_yearly',
    product: { name: SubscriptionPlanName.YEARLY },
  });

  const subscriptionWithMonthlyPlan = subscriptionFactory({
    phases: [subscriptionPhaseFactory({ item: { price: monthlyPlan } })],
  });

  describe('should render without errors', () => {
    it('should render name', async () => {
      const requestPlansMock = fillSubscriptionPlansAllQuery([monthlyPlan]);
      const requestMock = fillSubscriptionScheduleQueryWithPhases(
        [subscriptionPhaseFactory({ item: { price: monthlyPlan } })],
        defaultPaymentPlan
      );
      render(<Wrapper />, {
        apolloMocks: (defaultMocks) => defaultMocks.concat(requestMock, requestPlansMock),
      });

      expect(await screen.findByText(/monthly/i)).toBeInTheDocument();
    });

    it('should render plan price', async () => {
      const requestPlansMock = fillSubscriptionPlansAllQuery([monthlyPlan]);
      const requestMock = fillSubscriptionScheduleQueryWithPhases(
        [subscriptionPhaseFactory({ item: { price: monthlyPlan } })],
        defaultPaymentPlan
      );

      render(<Wrapper />, {
        apolloMocks: (defaultMocks) => defaultMocks.concat(requestMock, requestPlansMock),
      });
      expect(await screen.findByText(/\$10/i)).toBeInTheDocument();
    });
  });

  describe('button is clicked', () => {
    describe('next billing plan is different from the clicked one', () => {
      it('should call onSelect', async () => {
        const onSelect = jest.fn();
        const requestPlansMock = fillSubscriptionPlansAllQuery([monthlyPlan]);
        const requestMock = fillSubscriptionScheduleQueryWithPhases(
          [subscriptionPhaseFactory({ item: { price: yearlyPlan } })],
          defaultPaymentPlan
        );

        const { waitForApolloMocks } = render(<Wrapper onSelect={onSelect} />, {
          apolloMocks: (defaultMocks) => defaultMocks.concat(requestMock, requestPlansMock),
        });
        await waitForApolloMocks();
        await userEvent.click(screen.getByText(/select/i));
        expect(onSelect).toHaveBeenCalled();
      });
    });

    describe('next billing plan is same as the clicked one', () => {
      it('should not call onSelect', async () => {
        const tenantMock = fillCommonQueryWithUser(
          currentUserFactory({
            tenants: [
              tenantFactory({
                id: tenantId,
              }),
            ],
          })
        );
        const onSelect = jest.fn();
        const requestMock = fillSubscriptionScheduleQuery(subscriptionWithMonthlyPlan);
        const requestPlansMock = fillSubscriptionPlansAllQuery([monthlyPlan]);

        const { waitForApolloMocks } = render(<Wrapper onSelect={onSelect} />, {
          apolloMocks: [requestMock, requestPlansMock, tenantMock],
        });
        await waitForApolloMocks();

        await userEvent.click(screen.getByText(/select/i));
        expect(onSelect).not.toHaveBeenCalled();
      });
    });

    describe('active plan is clicked, but is has already been cancelled', () => {
      it('should call onSelect', async () => {
        const onSelect = jest.fn();
        const requestMock = fillSubscriptionScheduleQueryWithPhases(
          [subscriptionPhaseFactory({ item: { price: yearlyPlan } })],
          defaultPaymentPlan
        );
        const requestPlansMock = fillSubscriptionPlansAllQuery([monthlyPlan]);
        const { waitForApolloMocks } = render(<Wrapper onSelect={onSelect} />, {
          apolloMocks: (defaultMocks) => defaultMocks.concat(requestMock, requestPlansMock),
        });
        await waitForApolloMocks();
        await userEvent.click(screen.getByText(/select/i));
        expect(onSelect).toHaveBeenCalled();
      });
    });
  });

  describe('trial is eligible', () => {
    it('should show trial info', async () => {
      const tenantMock = fillCommonQueryWithUser(
        currentUserFactory({
          tenants: [
            tenantFactory({
              id: tenantId,
            }),
          ],
        })
      );
      const activableTrialSubscription = subscriptionFactory({ canActivateTrial: true });
      const requestSubscriptionMock = fillSubscriptionScheduleQuery(activableTrialSubscription, undefined, tenantId);
      const requestPlansMock = fillSubscriptionPlansAllQuery([monthlyPlan]);

      const { waitForApolloMocks } = render(<Wrapper />, {
        apolloMocks: [requestSubscriptionMock, requestPlansMock, tenantMock],
      });
      await waitForApolloMocks();
      expect(await screen.findByText(/will start with a trial/i)).toBeInTheDocument();
    });
  });

  describe('trial is illegible', () => {
    it('should not show trial info', async () => {
      const requestSubscriptionMock = fillSubscriptionScheduleQuery(subscriptionFactory({ canActivateTrial: false }));
      const requestPlansMock = fillSubscriptionPlansAllQuery([monthlyPlan]);

      const { waitForApolloMocks } = render(<Wrapper />, {
        apolloMocks: (defaultMocks) => defaultMocks.concat(requestSubscriptionMock, requestPlansMock),
      });
      await waitForApolloMocks();

      expect(screen.queryByText(/will start with a trial/i)).not.toBeInTheDocument();
    });
  });
});
