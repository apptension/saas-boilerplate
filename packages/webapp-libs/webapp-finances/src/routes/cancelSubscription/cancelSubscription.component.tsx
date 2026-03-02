import { Button, ButtonVariant, Link } from '@sb/webapp-core/components/buttons';
import { ConfirmDialog } from '@sb/webapp-core/components/confirmDialog';
import { FormattedDate } from '@sb/webapp-core/components/dateTime';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Paragraph } from '@sb/webapp-core/components/typography';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { Separator } from '@sb/webapp-core/components/ui/separator';
import { useGenerateTenantPath } from '@sb/webapp-tenants/hooks';
import { AlertTriangle, ArrowLeft, CreditCard, Info } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link as RouterLink } from 'react-router-dom';

import { useActiveSubscriptionDetails } from '../../components/activeSubscriptionContext';
import { RoutesConfig } from '../../config/routes';
import { useActiveSubscriptionDetailsData } from '../../hooks';
import { useCancelSubscription } from './cancelSubscription.hook';

export const CancelSubscription = () => {
  const intl = useIntl();
  const generateTenantPath = useGenerateTenantPath();
  const { activeSubscription } = useActiveSubscriptionDetails();

  const { activeSubscriptionRenewalDate, activeSubscriptionPlan } =
    useActiveSubscriptionDetailsData(activeSubscription);

  const { handleCancel } = useCancelSubscription();

  const hasActiveSubscription = activeSubscriptionPlan?.name && !activeSubscriptionPlan?.isFree;

  return (
    <PageLayout>
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'Cancel Subscription',
          id: 'Cancel subscription / page title',
        })}
      />

      <div className="mx-auto w-full max-w-5xl space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <RouterLink
            to={generateTenantPath(RoutesConfig.subscriptions.index)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <FormattedMessage defaultMessage="Back to subscription" id="Cancel subscription / Back" />
          </RouterLink>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <h1 className="text-3xl font-bold tracking-tight">
              <FormattedMessage defaultMessage="Cancel Subscription" id="Cancel subscription / Header" />
            </h1>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            <FormattedMessage
              defaultMessage="Details about your current plan"
              id="Cancel subscription / Current plan label"
            />
          </Paragraph>
        </div>

        {!hasActiveSubscription ? (
          /* No Active Subscription Info Card */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                <FormattedMessage
                  defaultMessage="No Active Subscription"
                  id="Cancel subscription / No active subscription title"
                />
              </CardTitle>
              <CardDescription>
                <FormattedMessage
                  defaultMessage="You don't have an active paid subscription to cancel."
                  id="Cancel subscription / No active subscription description"
                />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Paragraph>
                  <FormattedMessage
                    defaultMessage="If you cancel your subscription, you will be moved to the free plan at the end of your current billing period. You'll continue to have access to all features until then."
                    id="Cancel subscription / Cancel explanation"
                  />
                </Paragraph>
                <Paragraph>
                  <FormattedMessage
                    defaultMessage="Alternatively, you can choose a different subscription plan that better fits your needs."
                    id="Cancel subscription / Alternative explanation"
                  />
                </Paragraph>
              </div>
              <Separator />
              <div>
                <Link
                  to={generateTenantPath(RoutesConfig.subscriptions.currentSubscription.edit)}
                  variant={ButtonVariant.PRIMARY}
                >
                  <FormattedMessage
                    defaultMessage="Choose a subscription plan"
                    id="Cancel subscription / Choose plan button"
                  />
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Current Plan Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  <FormattedMessage defaultMessage="Current plan info" id="Cancel subscription / Current plan header" />
                </CardTitle>
                <CardDescription>
                  <FormattedMessage
                    defaultMessage="Review your subscription details before canceling"
                    id="Cancel subscription / Current plan description"
                  />
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    <FormattedMessage defaultMessage="Active plan:" id="Cancel subscription / Active plan" />
                  </div>
                  <Paragraph className="text-base font-semibold">
                    {activeSubscriptionPlan?.name || (
                      <FormattedMessage defaultMessage="No active plan" id="Cancel subscription / No active plan" />
                    )}
                  </Paragraph>
                </div>

                <Separator />

                {activeSubscriptionPlan?.price !== undefined && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">
                      <FormattedMessage
                        defaultMessage="Active plan price:"
                        id="Cancel subscription / Active plan price"
                      />
                    </div>
                    <Paragraph className="text-base font-semibold">
                      ${activeSubscriptionPlan.price.toFixed(2)} USD
                      {activeSubscriptionPlan.name?.toLowerCase().includes('yearly') ? (
                        <span className="text-sm font-normal text-muted-foreground"> / year</span>
                      ) : (
                        <span className="text-sm font-normal text-muted-foreground"> / month</span>
                      )}
                    </Paragraph>
                  </div>
                )}

                {activeSubscriptionRenewalDate && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">
                        <FormattedMessage
                          defaultMessage="Next renewal / expiry:"
                          id="Cancel subscription / Next renewal"
                        />
                      </div>
                      <Paragraph className="text-base font-semibold">
                        <FormattedDate value={activeSubscriptionRenewalDate} />
                      </Paragraph>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Cancel Button Card */}
            <Card className="border-destructive/50">
              <CardContent className="pt-6">
                <ConfirmDialog
                  title={
                    <FormattedMessage
                      defaultMessage="Cancel subscription"
                      id="Cancel subscription / Confirm Dialog / Cancel Title"
                    />
                  }
                  description={
                    <FormattedMessage
                      id="Cancel subscription / Confirm Dialog / Cancel Description"
                      defaultMessage="Are you sure you want to cancel your subscription?"
                    />
                  }
                  onContinue={handleCancel}
                  variant="destructive"
                >
                  <Button variant="destructive" className="w-full sm:w-fit">
                    <FormattedMessage defaultMessage="Cancel subscription" id="Cancel subscription / Button label" />
                  </Button>
                </ConfirmDialog>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageLayout>
  );
};
