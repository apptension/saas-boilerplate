import { useIntl } from 'react-intl';
import { SubscriptionPlan, SubscriptionPlanName } from '../../../services/api/subscription/types';

export const useSubscriptionPlanDetails = (plan?: SubscriptionPlan) => {
  const intl = useIntl();

  const planDisplayNames = {
    [SubscriptionPlanName.FREE]: intl.formatMessage({
      description: 'Subscription plan display name / Free',
      defaultMessage: 'Free',
    }),
    [SubscriptionPlanName.MONTHLY]: intl.formatMessage({
      description: 'Subscription plan display name / Monthly',
      defaultMessage: 'Monthly',
    }),
    [SubscriptionPlanName.YEARLY]: intl.formatMessage({
      description: 'Subscription plan display name / Yearly',
      defaultMessage: 'Yearly',
    }),
  };

  return plan
    ? {
        name: planDisplayNames[plan.product.name],
        price: plan.unitAmount / 100,
      }
    : {};
};
