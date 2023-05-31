import { FragmentType, StripeSubscriptionQueryQuery, getFragmentData } from '@sb/webapp-api-client/graphql';
import { Button } from '@sb/webapp-core/components/buttons';
import { FormattedMessage } from 'react-intl';

import { useActiveSubscriptionDetailsData, useSubscriptionPlanDetails } from '../../../hooks';
import { SUBSRIPTION_PRICE_ITEM_FRAGMENT } from '../subscriptionPlans';
import { Container, Content, Feature, FeaturesList, Name } from './subscriptionPlanItem.styles';

export type SubscriptionPlanItemProps = {
  plan: FragmentType<typeof SUBSRIPTION_PRICE_ITEM_FRAGMENT>;
  onSelect: (id: string | null) => void;
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
  const data = getFragmentData(SUBSRIPTION_PRICE_ITEM_FRAGMENT, plan);
  const { name, price, features, isFree } = useSubscriptionPlanDetails(data);
  const { isTrialEligible, activeSubscriptionIsCancelled, activeSubscriptionPlan, nextSubscriptionPlanDetails } =
    useActiveSubscriptionDetailsData(activeSubscription);
  const isActive = activeSubscriptionPlan.name === name && !activeSubscriptionIsCancelled;
  const isScheduledForNextPeriod = nextSubscriptionPlanDetails.name === name;

  const handleSelect = () => onSelect(data?.pk ?? null);

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

      <Button onClick={handleSelect} disabled={isScheduledForNextPeriod || isFree || loading} className="mt-2">
        <FormattedMessage
          defaultMessage="Select ({price} USD)"
          id="Change plan item / Select button"
          values={{ price }}
        />
      </Button>
    </Container>
  );
};
