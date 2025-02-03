import { ButtonVariant, Link } from '@sb/webapp-core/components/buttons';
import { FormattedDate } from '@sb/webapp-core/components/dateTime';
import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { Card, CardContent, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { TabsContent } from '@sb/webapp-core/components/ui/tabs';
import { useGenerateTenantPath } from '@sb/webapp-tenants/hooks';
import { AlarmClock, ArrowRightToLine, CalendarClock, StepForward } from 'lucide-react';
import { FormattedMessage } from 'react-intl';

import { useActiveSubscriptionDetails } from '../../components/activeSubscriptionContext';
import { RoutesConfig } from '../../config/routes';
import { useActiveSubscriptionDetailsData } from '../../hooks';

const SubscriptionsContent = () => {
  const generateTenantPath = useGenerateTenantPath();

  const { activeSubscription } = useActiveSubscriptionDetails();

  const {
    isTrialActive,
    trialEnd,
    nextSubscriptionPlanDetails,
    activeSubscriptionRenewalDate,
    activeSubscriptionExpiryDate,
    activeSubscriptionIsCancelled,
    activeSubscriptionPlan,
  } = useActiveSubscriptionDetailsData(activeSubscription);

  return (
    <TabsContent value={generateTenantPath(RoutesConfig.subscriptions.index)}>
      <div className="space-y-6 pt-4">
        <PageHeadline
          header={
            <FormattedMessage
              defaultMessage="Current subscription"
              id="My subscription / Current subscription header"
            />
          }
          subheader={
            <FormattedMessage
              defaultMessage="Manage your subscription"
              id="My subscription / Current subscription subheader"
            />
          }
        />
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <FormattedMessage defaultMessage="Current plan:" id="My subscription / Active plan" />
                {` ${activeSubscriptionPlan?.name}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-1 p-1.5">
              {activeSubscriptionRenewalDate && (
                <div className="flex items-center space-x-4 rounded-md p-2 hover:bg-accent hover:text-accent-foreground">
                  <ArrowRightToLine className="h-5 w-5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      <FormattedMessage defaultMessage="Next renewal:" id="My subscription / Next renewal" />
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <FormattedDate value={activeSubscriptionRenewalDate} />
                    </p>
                  </div>
                </div>
              )}

              {!activeSubscriptionRenewalDate && activeSubscriptionExpiryDate && (
                <div className="flex items-center space-x-4 rounded-md p-2 hover:bg-accent hover:text-accent-foreground">
                  <CalendarClock className="h-5 w-5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      <FormattedMessage defaultMessage="Expiry date:" id="My subscription / Expiry date" />
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <FormattedDate value={activeSubscriptionExpiryDate} />
                    </p>
                  </div>
                </div>
              )}

              {nextSubscriptionPlanDetails && (
                <div className="flex items-center space-x-4 rounded-md p-2 hover:bg-accent hover:text-accent-foreground">
                  <StepForward className="h-5 w-5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      <FormattedMessage defaultMessage="Next billing plan:" id="My subscription / Next plan" />
                    </p>
                    <p className="text-sm text-muted-foreground">{nextSubscriptionPlanDetails?.name}</p>
                  </div>
                </div>
              )}

              {isTrialActive && trialEnd && (
                <div className="flex items-center space-x-4 rounded-md p-2 hover:bg-accent hover:text-accent-foreground">
                  <AlarmClock className="h-5 w-5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      <FormattedMessage
                        defaultMessage="Free trial expiry date:"
                        id="My subscription / Trial expiry date"
                      />
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <FormattedDate value={trialEnd} />
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex flex-col sm:flex-row gap-6">
            <Link
              to={generateTenantPath(RoutesConfig.subscriptions.currentSubscription.edit)}
              variant={ButtonVariant.PRIMARY}
            >
              <FormattedMessage defaultMessage="Edit subscription" id="My subscription / Edit subscription" />
            </Link>

            {activeSubscriptionPlan && !activeSubscriptionPlan.isFree && !activeSubscriptionIsCancelled && (
              <Link
                to={generateTenantPath(RoutesConfig.subscriptions.currentSubscription.cancel)}
                variant={ButtonVariant.SECONDARY}
              >
                <FormattedMessage defaultMessage="Cancel subscription" id="My subscription / Cancel subscription" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </TabsContent>
  );
};

export default SubscriptionsContent;
