import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { useFragment } from 'react-relay';

import {
  useActiveSubscriptionPlanDetails,
  useSubscriptionPlanDetails,
} from '../../../../shared/hooks/finances/useSubscriptionPlanDetails';
import {
  selectActiveSubscriptionNextPlan,
  selectIsSubscriptionCanceled,
  selectIsTrialEligible,
} from '../../../../modules/subscription/subscription.selectors';
import subscriptionPlanItemFragmentGraphql, {
  subscriptionPlanItemFragment$key,
} from '../../../../modules/subscription/__generated__/subscriptionPlanItemFragment.graphql';
import { Container, Content, Feature, FeaturesList, SelectButton, Name } from './subscriptionPlanItem.styles';

export type SubscriptionPlanItemProps = {
  plan: subscriptionPlanItemFragment$key;
  onSelect: (id: string | null) => void;
  className?: string;
};

export const SubscriptionPlanItem = ({ plan, onSelect, className }: SubscriptionPlanItemProps) => {
  const data = useFragment<subscriptionPlanItemFragment$key>(subscriptionPlanItemFragmentGraphql, plan);
  const { name, price, features, isFree } = useSubscriptionPlanDetails(data);
  const activeSubscription = useActiveSubscriptionPlanDetails({ forceRefetch: false });
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
                id="Change plan item / Trial eligible info"
              />
            </Feature>
          )}
        </FeaturesList>
      </Content>

      <SelectButton onClick={() => onSelect(data.pk)} disabled={isScheduledForNextPeriod || isFree}>
        <FormattedMessage
          defaultMessage="Select ({price} USD)"
          id="Change plan item / Select button"
          values={{ price }}
        />
      </SelectButton>
    </Container>
  );
};
