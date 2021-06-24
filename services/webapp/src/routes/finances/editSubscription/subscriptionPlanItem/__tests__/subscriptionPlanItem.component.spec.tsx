import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubscriptionPlanItem, SubscriptionPlanItemProps } from '../subscriptionPlanItem.component';
import { subscriptionFactory, subscriptionPhaseFactory, subscriptionPlanFactory } from '../../../../../mocks/factories';
import { SubscriptionPlanName } from '../../../../../shared/services/api/subscription/types';
import { makeContextRenderer } from '../../../../../shared/utils/testUtils';
import { prepareState } from '../../../../../mocks/store';

const plan = subscriptionPlanFactory({
  unitAmount: 250,
  product: {
    name: SubscriptionPlanName.MONTHLY,
  },
});

describe('SubscriptionPlanItem: Component', () => {
  const defaultProps: SubscriptionPlanItemProps = { plan, onSelect: () => null };

  const component = (props: Partial<SubscriptionPlanItemProps>) => (
    <SubscriptionPlanItem {...defaultProps} {...props} />
  );
  const render = makeContextRenderer(component);

  it('should render name', () => {
    render();
    expect(screen.getByText(/monthly/gi)).toBeInTheDocument();
  });

  it('should render plan price', () => {
    render();
    expect(screen.getByText(/2\.5 USD/gi)).toBeInTheDocument();
  });

  describe('button is clicked', () => {
    describe('next billing plan is different from the clicked one', () => {
      const yearlyPlan = subscriptionPlanFactory({ id: 'plan_yearly', product: { name: SubscriptionPlanName.YEARLY } });
      const monthlyPlan = subscriptionPlanFactory({
        id: 'plan_monthly',
        product: { name: SubscriptionPlanName.MONTHLY },
      });
      const store = prepareState((state) => {
        state.subscription.activeSubscription = subscriptionFactory({
          phases: [
            subscriptionPhaseFactory({ item: { price: monthlyPlan } }),
            subscriptionPhaseFactory({ item: { price: yearlyPlan } }),
          ],
        });
      });

      it('should call onSelect', () => {
        const onSelect = jest.fn();
        render({ onSelect }, { store });
        userEvent.click(screen.getByText(/select/gi));
        expect(onSelect).toHaveBeenCalled();
      });
    });

    describe('next billing plan is same as the clicked one', () => {
      const monthlyPlan = subscriptionPlanFactory({
        id: 'plan_monthly',
        product: { name: SubscriptionPlanName.MONTHLY },
      });
      const store = prepareState((state) => {
        state.subscription.activeSubscription = subscriptionFactory({
          phases: [subscriptionPhaseFactory({ item: { price: monthlyPlan } })],
        });
      });

      it('should not call onSelect', () => {
        const onSelect = jest.fn();
        render({ onSelect }, { store });
        userEvent.click(screen.getByText(/select/gi));
        expect(onSelect).not.toHaveBeenCalled();
      });
    });

    describe('active plan is clicked, but is has already been cancelled', () => {
      const monthlyPlan = subscriptionPlanFactory({
        id: 'plan_monthly',
        product: { name: SubscriptionPlanName.MONTHLY },
      });
      const freePlan = subscriptionPlanFactory({
        id: 'plan_free',
        product: { name: SubscriptionPlanName.FREE },
      });
      const store = prepareState((state) => {
        state.subscription.activeSubscription = subscriptionFactory({
          phases: [
            subscriptionPhaseFactory({ item: { price: monthlyPlan } }),
            subscriptionPhaseFactory({ item: { price: freePlan } }),
          ],
        });
      });

      it('should call onSelect', () => {
        const onSelect = jest.fn();
        render({ onSelect }, { store });
        userEvent.click(screen.getByText(/select/gi));
        expect(onSelect).toHaveBeenCalled();
      });
    });
  });

  describe('trial is eligible', () => {
    it('should show trial info', () => {
      const storeWithTrial = prepareState((state) => {
        state.subscription.activeSubscription = subscriptionFactory({ canActivateTrial: true });
      });

      render({}, { store: storeWithTrial });
      expect(screen.getByText(/will start with a trial/gi)).toBeInTheDocument();
    });
  });

  describe('trial is illegible', () => {
    it('should not show trial info', () => {
      const storeWithoutTrial = prepareState((state) => {
        state.subscription.activeSubscription = subscriptionFactory({ canActivateTrial: false });
      });
      render({}, { store: storeWithoutTrial });
      expect(screen.queryByText(/will start with a trial/gi)).not.toBeInTheDocument();
    });
  });
});
