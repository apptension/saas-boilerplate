import { StripeSubscriptionQueryQuery } from '@sb/webapp-api-client/graphql';
import { ButtonVariant } from '@sb/webapp-core/components/buttons';
import { FormattedDate } from '@sb/webapp-core/components/dateTime';
import { FormattedMessage } from 'react-intl';

import { RoutesConfig } from '../../../app/config/routes';
import { useGenerateLocalePath } from '../../../shared/hooks';
import { useActiveSubscriptionDetailsData } from '../hooks/useActiveSubscriptionDetailsData/useActiveSubscriptionDetailsData';
import { Link, Row, RowValue, Subheader } from './subscriptions.styles';

type SubscriptionsContentProps = {
  activeSubscription: StripeSubscriptionQueryQuery['activeSubscription'];
};

export const SubscriptionsContent = ({ activeSubscription }: SubscriptionsContentProps) => {
  const generateLocalePath = useGenerateLocalePath();
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
