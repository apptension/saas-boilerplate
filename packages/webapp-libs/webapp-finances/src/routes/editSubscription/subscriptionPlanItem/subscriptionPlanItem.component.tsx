import { FragmentType, StripeSubscriptionQueryQuery, getFragmentData } from '@sb/webapp-api-client/graphql';
import { Button } from '@sb/webapp-core/components/buttons';
import { Badge } from '@sb/webapp-core/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { cn } from '@sb/webapp-core/lib/utils';
import { Check, Clock, Crown, Gift, Sparkles, Zap } from 'lucide-react';
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
  const isActive = activeSubscriptionPlan?.name === name && !activeSubscriptionIsCancelled;
  const isScheduledForNextPeriod = nextSubscriptionPlanDetails?.name === name;
  const isPremium = name?.toLowerCase().includes('yearly');
  const isMonthly = name?.toLowerCase().includes('monthly');

  const handleSelect = () => onSelect(data?.pk ?? null);

  const getButtonText = () => {
    if (isActive) {
      return <FormattedMessage defaultMessage="Current plan" id="Change plan item / Current plan" />;
    }
    if (isScheduledForNextPeriod) {
      return <FormattedMessage defaultMessage="Scheduled" id="Change plan item / Scheduled" />;
    }
    if (isFree) {
      return <FormattedMessage defaultMessage="Free plan" id="Change plan item / Free plan button" />;
    }
    return <FormattedMessage defaultMessage="Select plan" id="Change plan item / Select plan" />;
  };

  const getButtonVariant = () => {
    if (isActive) return 'outline' as const;
    if (isPremium) return 'default' as const;
    return 'default' as const;
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200 hover:shadow-lg',
        {
          // Active plan styling
          'ring-2 ring-primary border-primary shadow-md': isActive,
          // Premium/Yearly plan styling
          'border-amber-200 dark:border-amber-800 bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-950/20':
            isPremium && !isActive,
          // Monthly paid plan styling
          'border-blue-200 dark:border-blue-800 bg-gradient-to-b from-blue-50/30 to-transparent dark:from-blue-950/20':
            isMonthly && !isFree && !isActive && !isPremium,
          // Free plan styling
          'bg-muted/30': isFree && !isActive,
        },
        className
      )}
    >
      {/* Premium plan corner ribbon */}
      {isPremium && !isActive && (
        <div className="absolute top-0 right-0">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg shadow-sm flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            <FormattedMessage defaultMessage="Best value" id="Change plan item / Best value" />
          </div>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Plan icon */}
            <div
              className={cn('p-2 rounded-lg', {
                'bg-primary/10 text-primary': isActive,
                'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400': isPremium && !isActive,
                'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400':
                  isMonthly && !isFree && !isActive && !isPremium,
                'bg-muted text-muted-foreground': isFree && !isActive,
              })}
            >
              {isFree ? (
                <Gift className="h-5 w-5" />
              ) : isPremium ? (
                <Crown className="h-5 w-5" />
              ) : (
                <Zap className="h-5 w-5" />
              )}
            </div>
            <CardTitle className="text-xl">{name}</CardTitle>
          </div>

          {/* Status badges */}
          <div className="flex gap-1.5">
            {isActive && (
              <Badge variant="success" className="gap-1">
                <Check className="h-3 w-3" />
                <FormattedMessage defaultMessage="Active" id="Change plan item / Active badge" />
              </Badge>
            )}
            {isScheduledForNextPeriod && !isActive && (
              <Badge variant="info" className="gap-1">
                <Clock className="h-3 w-3" />
                <FormattedMessage defaultMessage="Scheduled" id="Change plan item / Scheduled badge" />
              </Badge>
            )}
            {isFree && !isActive && (
              <Badge variant="muted">
                <FormattedMessage defaultMessage="Free" id="Change plan item / Free badge" />
              </Badge>
            )}
          </div>
        </div>

        <CardDescription className="mt-2">
          {isFree ? (
            <FormattedMessage
              defaultMessage="Get started with basic features"
              id="Change plan item / Free plan description"
            />
          ) : isPremium ? (
            <FormattedMessage
              defaultMessage="Best value for committed users"
              id="Change plan item / Premium plan description"
            />
          ) : (
            <FormattedMessage
              defaultMessage="Flexible monthly subscription"
              id="Change plan item / Monthly plan description"
            />
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pricing section */}
        <div className="flex items-baseline gap-1">
          {isFree ? (
            <span className="text-3xl font-bold text-muted-foreground">
              <FormattedMessage defaultMessage="Free" id="Change plan item / Free price" />
            </span>
          ) : (
            <>
              <span
                className={cn('text-4xl font-bold', {
                  'text-primary': isActive,
                  'text-amber-600 dark:text-amber-400': isPremium && !isActive,
                })}
              >
                ${price?.toFixed(2) || '0.00'}
              </span>
              <span className="text-muted-foreground text-sm">
                /{' '}
                {name?.toLowerCase().includes('yearly') ? (
                  <FormattedMessage defaultMessage="year" id="Change plan item / year" />
                ) : (
                  <FormattedMessage defaultMessage="month" id="Change plan item / month" />
                )}
              </span>
            </>
          )}
        </div>

        {/* Yearly savings badge */}
        {isPremium && !isFree && (
          <Badge variant="success" className="text-xs">
            <FormattedMessage defaultMessage="Save 17% vs monthly" id="Change plan item / Yearly savings" />
          </Badge>
        )}

        {/* Trial eligible notice */}
        {isTrialEligible && !isFree && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800">
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              <FormattedMessage
                defaultMessage="Start with a free trial"
                id="Change plan item / Trial eligible notice"
              />
            </span>
          </div>
        )}

        {/* Action button */}
        <Button
          onClick={handleSelect}
          disabled={isScheduledForNextPeriod || isFree || loading || isActive}
          variant={getButtonVariant()}
          className={cn('w-full', {
            'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0':
              isPremium && !isActive && !isScheduledForNextPeriod && !isFree,
          })}
          size="lg"
        >
          {loading ? (
            <FormattedMessage defaultMessage="Loading..." id="Change plan item / Loading" />
          ) : (
            getButtonText()
          )}
        </Button>

        {/* Features list */}
        <div className="pt-4 border-t">
          <p className="text-sm font-medium mb-3 text-foreground">
            <FormattedMessage defaultMessage="Includes:" id="Change plan item / Features header" />
          </p>
          <ul className="space-y-2.5">
            {features?.map((feature, index) => (
              <li key={[feature, index].join()} className="flex items-start gap-2">
                <div
                  className={cn('mt-0.5 rounded-full p-0.5', {
                    'bg-primary/10 text-primary': isActive,
                    'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400': isPremium && !isActive,
                    'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400':
                      isMonthly && !isFree && !isActive && !isPremium,
                    'bg-muted text-muted-foreground': isFree && !isActive,
                  })}
                >
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
