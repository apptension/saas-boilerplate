import { FragmentType, StripeSubscriptionQueryQuery, getFragmentData } from '@sb/webapp-api-client/graphql';
import { Button } from '@sb/webapp-core/components/buttons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { cn } from '@sb/webapp-core/lib/utils';
import { FormattedMessage } from 'react-intl';

import { useActiveSubscriptionDetailsData, useSubscriptionPlanDetails } from '../../../hooks';
import { SUBSRIPTION_PRICE_ITEM_FRAGMENT } from '../subscriptionPlans';

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
    <Card
      className={cn(className, {
        'border-primary border-2': isActive,
      })}
    >
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>
          <FormattedMessage defaultMessage="Plan description" id="Change plan item / Plan description" />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <span className="text-3xl">${price}</span>
          <span>
            {' '}
            / <FormattedMessage defaultMessage="month" id="Change plan item / month" values={{ price }} />
          </span>
        </div>
        <Button onClick={handleSelect} disabled={isScheduledForNextPeriod || isFree || loading}>
          <FormattedMessage defaultMessage="Select plan" id="Change plan item / Select plan" />
        </Button>

        <ul className="space-y-2">
          {features?.map((feature, index) => (
            <li key={[feature, index].join()} className="leading-3">
              <span className="text-muted-foreground text-sm">{feature}</span>
            </li>
          ))}
          {isTrialEligible && !isFree && (
            <li className="leading-3">
              <span className="text-muted-foreground text-sm">
                <FormattedMessage
                  defaultMessage="Your subscription will start with a trial"
                  id="Change plan item / Trial eligible info"
                />
              </span>
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};
