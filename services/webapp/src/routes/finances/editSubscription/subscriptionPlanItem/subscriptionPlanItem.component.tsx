import React, { ComponentProps, forwardRef } from 'react';

import { SubscriptionPlan } from '../../../../shared/services/api/subscription/types';
import { RadioButton } from '../../../../shared/components/radioButton';
import { useSubscriptionPlanDetails } from '../../../../shared/hooks/finances/useSubscriptionPlanDetails';
import { Container } from './subscriptionPlanItem.styles';

export interface SubscriptionPlanItemProps extends ComponentProps<typeof RadioButton> {
  plan: SubscriptionPlan;
}

export const SubscriptionPlanItem = forwardRef<HTMLInputElement, SubscriptionPlanItemProps>(
  ({ plan, ...radioProps }: SubscriptionPlanItemProps, ref) => {
    const { name, price } = useSubscriptionPlanDetails(plan);

    return (
      <Container {...radioProps} ref={ref}>
        {name} [{price} zł]
      </Container>
    );
  }
);
