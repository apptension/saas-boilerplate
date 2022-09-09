import { PreloadedQuery, usePreloadedQuery, useFragment } from 'react-relay';
import { FormattedMessage } from 'react-intl';

import SubscriptionActivePlanDetailsQuery, {
  subscriptionActivePlanDetailsQuery,
} from '../../../modules/subscription/__generated__/subscriptionActivePlanDetailsQuery.graphql';
import subscriptionPlanItemFragmentGraphql, {
  subscriptionPlanItemFragment$key,
} from '../../../modules/subscription/__generated__/subscriptionPlanItemFragment.graphql';
import { FormattedDate } from '../../../shared/components/dateTime/formattedDate';
import { RoutesConfig } from '../../../app/config/routes';
import { ButtonVariant } from '../../../shared/components/forms/button';
import { SubscriptionPlanName } from '../../../shared/services/api/subscription/types';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';
import { useSubscriptionPlanDetails } from '../../../shared/hooks/finances/useSubscriptionPlanDetails';
import { Link, Row, RowValue, Subheader } from './subscriptions.styles';

type SubscriptionsContentProps = {
  activeSubscriptionQueryRef: PreloadedQuery<subscriptionActivePlanDetailsQuery>;
};

export const SubscriptionsContent = ({ activeSubscriptionQueryRef }: SubscriptionsContentProps) => {
  const generateLocalePath = useGenerateLocalePath();
  const data = usePreloadedQuery(SubscriptionActivePlanDetailsQuery, activeSubscriptionQueryRef);
  const phases = data.activeSubscription?.phases || [];
  const currentPhasePlan = phases[0]!.item!.price;
  const currentPhasePlanData = useFragment<subscriptionPlanItemFragment$key>(
    subscriptionPlanItemFragmentGraphql,
    currentPhasePlan
  );
  const activeSubscriptionPlan = useSubscriptionPlanDetails(currentPhasePlanData || undefined);
  const activeSubscriptionPeriodEndDate = phases[0]?.endDate;
  const nextPhasePlanData = useFragment<subscriptionPlanItemFragment$key>(
    subscriptionPlanItemFragmentGraphql,
    phases.length > 1 ? phases[1]!.item!.price : currentPhasePlan
  );
  const activeSubscriptionIsCancelled = phases[1] && nextPhasePlanData?.product.name === SubscriptionPlanName.FREE;
  const activeSubscriptionExpiryDate = activeSubscriptionIsCancelled ? phases[1]?.startDate?.toString() : undefined;
  const activeSubscriptionRenewalDate = activeSubscriptionIsCancelled ? undefined : activeSubscriptionPeriodEndDate;
  const nextSubscriptionPlan = nextPhasePlanData ?? currentPhasePlanData;
  const nextSubscriptionPlanDetails = useSubscriptionPlanDetails(nextSubscriptionPlan || undefined);
  const trialEnd = data.activeSubscription?.subscription?.trialEnd?.toString();
  const isTrialActive = Boolean(trialEnd && Date.parse(trialEnd.toString()) >= Date.now());

  return (
    <>
      <Subheader>
        <FormattedMessage defaultMessage="Current plan:" id="My subscription / Active plan" />
        <RowValue>{activeSubscriptionPlan?.name}</RowValue>
      </Subheader>

      {activeSubscriptionRenewalDate && (
        <Row>
          <FormattedMessage defaultMessage="Next renewal:" id="My subscription / Next renewal" />
          <RowValue>
            <FormattedDate value={activeSubscriptionRenewalDate} />
          </RowValue>
        </Row>
      )}

      {!activeSubscriptionRenewalDate && activeSubscriptionExpiryDate && (
        <Row>
          <FormattedMessage defaultMessage="Expiry date:" id="My subscription / Expiry date" />
          <RowValue>
            <FormattedDate value={activeSubscriptionExpiryDate} />
          </RowValue>
        </Row>
      )}

      {nextSubscriptionPlanDetails && (
        <Row>
          <FormattedMessage defaultMessage="Next billing plan:" id="My subscription / Next plan" />
          <RowValue>{nextSubscriptionPlanDetails?.name}</RowValue>
        </Row>
      )}

      {isTrialActive && trialEnd && (
        <>
          <Subheader>
            <FormattedMessage defaultMessage="Free trial info" id="My subscription / Trial header" />
          </Subheader>
          <Row>
            <FormattedMessage defaultMessage="Expiry date:" id="My subscription / Trial expiry date" />
            <RowValue>
              <FormattedDate value={trialEnd} />
            </RowValue>
          </Row>
        </>
      )}

      <Link to={generateLocalePath(RoutesConfig.subscriptions.changePlan)}>
        <FormattedMessage defaultMessage="Edit subscription" id="My subscription / Edit subscription" />
      </Link>

      {activeSubscriptionPlan && !activeSubscriptionPlan.isFree && !activeSubscriptionIsCancelled && (
        <Link to={generateLocalePath(RoutesConfig.subscriptions.cancel)} variant={ButtonVariant.SECONDARY}>
          <FormattedMessage defaultMessage="Cancel subscription" id="My subscription / Cancel subscription" />
        </Link>
      )}
    </>
  );
};
