import { FormattedMessage } from 'react-intl';
import { useFragment } from 'react-relay';

import subscriptionPlanItemFragmentGraphql, {
  subscriptionPlanItemFragment$key,
} from '../../../../modules/subscription/__generated__/subscriptionPlanItemFragment.graphql';
import { useActiveSubscriptionDetailsData } from '../../../../shared/hooks/finances/useActiveSubscriptionDetailsData/useActiveSubscriptionDetailsData';
import { useSubscriptionPlanDetails } from '../../../../shared/hooks/finances/useSubscriptionPlanDetails';
import { StripeSubscriptionQueryQuery } from '../../../../shared/services/graphqlApi/__generated/gql/graphql';
import { Container, Content, Feature, FeaturesList, Name, SelectButton } from './subscriptionPlanItem.styles';

export type SubscriptionPlanItemProps = {
  plan: subscriptionPlanItemFragment$key;
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
  const data = useFragment<subscriptionPlanItemFragment$key>(subscriptionPlanItemFragmentGraphql, plan);
  const { name, price, features, isFree } = useSubscriptionPlanDetails(data);
  const { isTrialEligible, activeSubscriptionIsCancelled, activeSubscriptionPlan, nextSubscriptionPlanDetails } =
    useActiveSubscriptionDetailsData(activeSubscription);
  const isActive = activeSubscriptionPlan.name === name && !activeSubscriptionIsCancelled;
  const isScheduledForNextPeriod = nextSubscriptionPlanDetails.name === name;

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

      <SelectButton onClick={() => onSelect(data.pk)} disabled={isScheduledForNextPeriod || isFree || loading}>
        <FormattedMessage
          defaultMessage="Select ({price} USD)"
          id="Change plan item / Select button"
          values={{ price }}
        />
      </SelectButton>
    </Container>
  );
};
