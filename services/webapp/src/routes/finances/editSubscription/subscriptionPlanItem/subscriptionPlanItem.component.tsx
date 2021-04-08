import React from 'react';

import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { SubscriptionPlan } from '../../../../shared/services/api/subscription/types';
import {
  useActiveSubscriptionPlanDetails,
  useSubscriptionPlanDetails,
} from '../../../../shared/hooks/finances/useSubscriptionPlanDetails';
import {
  selectActiveSubscriptionNextPlan,
  selectIsSubscriptionCanceled,
  selectIsTrialEligible,
} from '../../../../modules/subscription/subscription.selectors';
import { Container, Content, Feature, FeaturesList, SelectButton, Name } from './subscriptionPlanItem.styles';

export interface SubscriptionPlanItemProps {
  plan: SubscriptionPlan;
  onSelect: () => void;
  className?: string;
}

export const SubscriptionPlanItem = ({ plan, onSelect, className }: SubscriptionPlanItemProps) => {
  const { name, price, features, isFree } = useSubscriptionPlanDetails(plan);
  const activeSubscription = useActiveSubscriptionPlanDetails();
  const nextSubscriptionPlan = useSelector(selectActiveSubscriptionNextPlan);
  const isActivePlanCancelled = useSelector(selectIsSubscriptionCanceled);
  const isActive = activeSubscription.name === name && !isActivePlanCancelled;
  const isScheduledForNextPeriod = useSubscriptionPlanDetails(nextSubscriptionPlan).name === name;
  const isTrialEligible = useSelector(selectIsTrialEligible);

  return (
    <Container isActive={isActive} className={className}>
      <Content>
        <Name>{name}</Name>

        <FeaturesList>
          {features?.map((feature, index) => (
            <Feature key={[feature, index].join()}>{feature}</Feature>
          ))}
          {isTrialEligible && !isFree && (
            <Feature>
              <FormattedMessage
                defaultMessage="Your subscription will start with a trial"
                description="Change plan item / Trial eligible info"
              />
            </Feature>
          )}
        </FeaturesList>
      </Content>

      <SelectButton onClick={onSelect} disabled={isScheduledForNextPeriod || isFree}>
        <FormattedMessage
          defaultMessage="Select ({price} USD)"
          description="Change plan item / Select button"
          values={{ price }}
        />
      </SelectButton>
    </Container>
  );
};
