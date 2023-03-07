import { FormattedMessage } from 'react-intl';

import { FragmentType, useFragment } from '../../../../shared/services/graphqlApi/__generated/gql';
import { StripeSubscriptionQueryQuery } from '../../../../shared/services/graphqlApi/__generated/gql/graphql';
import { useActiveSubscriptionDetailsData } from '../../hooks/useActiveSubscriptionDetailsData/useActiveSubscriptionDetailsData';
import { useSubscriptionPlanDetails } from '../../hooks/useSubscriptionPlanDetails';
import { SUBSRIPTION_PRICE_ITEM_FRAGMENT } from '../subscriptionPlans/subscriptionPlans.graphql';
import { Container, Content, Feature, FeaturesList, Name, SelectButton } from './subscriptionPlanItem.styles';

export type SubscriptionPlanItemProps = {
  plan: FragmentType<typeof SUBSRIPTION_PRICE_ITEM_FRAGMENT>;
  onSelect: (id: string | null | undefined) => void;
  className?: string;
  activeSubscription: StripeSubscriptionQueryQuery['activeSubscription'];
  loading: boolean;
};

export const SubscriptionPlanItem = ({
  plan,
  onSelect,
  className,
  activeSubscription,
  loading,
}: SubscriptionPlanItemProps) => {
  const data = useFragment(SUBSRIPTION_PRICE_ITEM_FRAGMENT, plan);
  const { name, price, features, isFree } = useSubscriptionPlanDetails(data);
  const { isTrialEligible, activeSubscriptionIsCancelled, activeSubscriptionPlan, nextSubscriptionPlanDetails } =
    useActiveSubscriptionDetailsData(activeSubscription);
  const isActive = activeSubscriptionPlan.name === name && !activeSubscriptionIsCancelled;
  const isScheduledForNextPeriod = nextSubscriptionPlanDetails.name === name;

  const handleSelect = () => onSelect(data.pk);

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

      <SelectButton onClick={handleSelect} disabled={isScheduledForNextPeriod || isFree || loading}>
        <FormattedMessage
          defaultMessage="Select ({price} USD)"
          id="Change plan item / Select button"
          values={{ price }}
        />
      </SelectButton>
    </Container>
  );
};
