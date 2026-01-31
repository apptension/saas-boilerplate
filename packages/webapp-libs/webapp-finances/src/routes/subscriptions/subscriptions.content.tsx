import { ButtonVariant, Link } from '@sb/webapp-core/components/buttons';
import { FormattedDate } from '@sb/webapp-core/components/dateTime';
import { Alert, AlertDescription } from '@sb/webapp-core/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { TabsContent } from '@sb/webapp-core/components/ui/tabs';
import { useGenerateTenantPath, usePermissionCheck } from '@sb/webapp-tenants/hooks';
import { AlarmClock, ArrowRightToLine, CalendarClock, CreditCard, Info, Package, StepForward } from 'lucide-react';
import { FormattedMessage } from 'react-intl';

import { useActiveSubscriptionDetails } from '../../components/activeSubscriptionContext';
import { RoutesConfig } from '../../config/routes';
import { useActiveSubscriptionDetailsData } from '../../hooks';

const SubscriptionsContent = () => {
  const generateTenantPath = useGenerateTenantPath();
  
  // Permission check for managing billing
  const { hasPermission: canManageBilling } = usePermissionCheck('billing.manage');

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
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <FormattedMessage
                defaultMessage="Current subscription"
                id="My subscription / Current subscription header"
              />
            </CardTitle>
            <CardDescription>
              <FormattedMessage
                defaultMessage="Manage your subscription"
                id="My subscription / Current subscription subheader"
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    <FormattedMessage defaultMessage="Current plan:" id="My subscription / Active plan" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeSubscriptionPlan?.name ? (
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-2xl font-semibold">{activeSubscriptionPlan.name}</p>
                        {activeSubscriptionPlan?.price !== undefined && activeSubscriptionPlan.price > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            ${activeSubscriptionPlan.price.toFixed(2)} /{' '}
                            {activeSubscriptionPlan.name?.toLowerCase().includes('yearly') ? (
                              <FormattedMessage defaultMessage="year" id="My subscription / Year" />
                            ) : (
                              <FormattedMessage defaultMessage="month" id="My subscription / Month" />
                            )}
                          </p>
                        )}
                        {activeSubscriptionPlan?.isFree && (
                          <p className="text-sm text-muted-foreground mt-1">
                            <FormattedMessage defaultMessage="Free plan" id="My subscription / Free plan" />
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="rounded-full bg-muted p-4 mb-4">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">
                        <FormattedMessage defaultMessage="No active plan" id="My subscription / No active plan" />
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-sm mb-4">
                        <FormattedMessage
                          defaultMessage="You don't have an active subscription plan. Choose a plan to unlock premium features."
                          id="My subscription / No active plan description"
                        />
                      </p>
                      <Alert variant="default" className="text-left max-w-md">
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          <FormattedMessage
                            defaultMessage="Developers: 1) Create Products & Prices in Stripe Dashboard (dashboard.stripe.com) 2) Run: pnpm saas backend stripe sync"
                            id="My subscription / Developer hint"
                          />
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                  {activeSubscriptionPlan?.name && (
                    <div className="space-y-2 pt-2 border-t">
                      {activeSubscriptionRenewalDate && (
                        <div className="flex items-center gap-3 rounded-md p-3 bg-muted/50">
                          <ArrowRightToLine className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              <FormattedMessage defaultMessage="Next renewal:" id="My subscription / Next renewal" />
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <FormattedDate value={activeSubscriptionRenewalDate} />
                            </p>
                          </div>
                        </div>
                      )}

                      {!activeSubscriptionRenewalDate && activeSubscriptionExpiryDate && (
                        <div className="flex items-center gap-3 rounded-md p-3 bg-muted/50">
                          <CalendarClock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              <FormattedMessage defaultMessage="Expiry date:" id="My subscription / Expiry date" />
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <FormattedDate value={activeSubscriptionExpiryDate} />
                            </p>
                          </div>
                        </div>
                      )}

                      {nextSubscriptionPlanDetails?.name && (
                        <div className="flex items-center gap-3 rounded-md p-3 bg-muted/50">
                          <StepForward className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              <FormattedMessage defaultMessage="Next billing plan:" id="My subscription / Next plan" />
                            </p>
                            <p className="text-sm text-muted-foreground">{nextSubscriptionPlanDetails.name}</p>
                          </div>
                        </div>
                      )}

                      {isTrialActive && trialEnd && (
                        <div className="flex items-center gap-3 rounded-md p-3 bg-muted/50">
                          <AlarmClock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
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
                    </div>
                  )}
                </CardContent>
              </Card>
              {canManageBilling && (
                <div className="flex flex-col sm:flex-row gap-6">
                  <Link
                    to={generateTenantPath(RoutesConfig.subscriptions.currentSubscription.edit)}
                    variant={ButtonVariant.PRIMARY}
                  >
                    <FormattedMessage defaultMessage="Edit subscription" id="My subscription / Edit subscription" />
                  </Link>

                  {activeSubscriptionPlan?.name && !activeSubscriptionPlan.isFree && !activeSubscriptionIsCancelled && (
                    <Link
                      to={generateTenantPath(RoutesConfig.subscriptions.currentSubscription.cancel)}
                      variant={ButtonVariant.SECONDARY}
                    >
                      <FormattedMessage defaultMessage="Cancel subscription" id="My subscription / Cancel subscription" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
};

export default SubscriptionsContent;
