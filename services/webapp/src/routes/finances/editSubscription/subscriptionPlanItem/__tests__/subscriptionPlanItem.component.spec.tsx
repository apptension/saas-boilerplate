import React from 'react';

import { screen } from '@testing-library/react';
import { SubscriptionPlanItem, SubscriptionPlanItemProps } from '../subscriptionPlanItem.component';
import { subscriptionPlanFactory } from '../../../../../mocks/factories';
import { SubscriptionPlanName } from '../../../../../shared/services/api/subscription/types';
import { makeContextRenderer } from '../../../../../shared/utils/testUtils';

const plan = subscriptionPlanFactory({
  unitAmount: 250,
  product: {
    name: SubscriptionPlanName.MONTHLY,
  },
});

describe('SubscriptionPlanItem: Component', () => {
  const defaultProps: SubscriptionPlanItemProps = { plan };

  const component = (props: Partial<SubscriptionPlanItemProps>) => (
    <SubscriptionPlanItem {...defaultProps} {...props} />
  );
  const render = makeContextRenderer(component);

  it('should render name and price', () => {
    render();
    expect(screen.getByText('Monthly [2.5 zł]'));
  });
});
