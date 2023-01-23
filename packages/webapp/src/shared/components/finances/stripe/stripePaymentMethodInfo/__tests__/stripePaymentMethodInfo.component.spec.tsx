import { useEffect } from 'react';
import { screen } from '@testing-library/react';
import { useFragment, useLazyLoadQuery, useQueryLoader } from 'react-relay';
import { fillSubscriptionScheduleQuery, paymentMethodFactory } from '../../../../../../mocks/factories';
import { StripePaymentMethodCardBrand } from '../../../../../services/api/stripe/paymentMethod';
import { render } from '../../../../../../tests/utils/rendering';
import subscriptionActivePlanDetailsQueryGraphql, {
  subscriptionActivePlanDetailsQuery,
} from '../../../../../../modules/subscription/__generated__/subscriptionActivePlanDetailsQuery.graphql';
import subscriptionActiveSubscriptionFragmentGraphql, {
  subscriptionActiveSubscriptionFragment$key,
} from '../../../../../../modules/subscription/__generated__/subscriptionActiveSubscriptionFragment.graphql';
import { StripePaymentMethodInfo, StripePaymentMethodInfoProps } from '../stripePaymentMethodInfo.component';
import { getRelayEnv } from '../../../../../../tests/utils/relay';
import { matchTextContent } from '../../../../../../tests/utils/match';

const Component = (props: Partial<StripePaymentMethodInfoProps>) => {
  const [queryRef, loadQuery] = useQueryLoader<subscriptionActivePlanDetailsQuery>(
    subscriptionActivePlanDetailsQueryGraphql
  );
  useEffect(() => {
    loadQuery({});
  }, [loadQuery]);
  const data = useLazyLoadQuery<subscriptionActivePlanDetailsQuery>(
    subscriptionActivePlanDetailsQueryGraphql,
    queryRef || {}
  );

  const activeSubscription = useFragment<subscriptionActiveSubscriptionFragment$key>(
    subscriptionActiveSubscriptionFragmentGraphql,
    data.activeSubscription
  );

  if (!activeSubscription) return null;

  return <StripePaymentMethodInfo {...props} method={activeSubscription.defaultPaymentMethod} />;
};

describe('StripePaymentMethodInfo: Component', () => {
  it('should render all info', async () => {
    const relayEnvironment = getRelayEnv();
    fillSubscriptionScheduleQuery(relayEnvironment, {
      defaultPaymentMethod: paymentMethodFactory({
        billingDetails: {
          name: 'Owner',
        },
        card: {
          last4: '1234',
          brand: StripePaymentMethodCardBrand.Visa,
        },
      }),
    });
    render(<Component />, { relayEnvironment });
    expect(screen.getByText(matchTextContent('Owner Visa **** 1234'))).toBeInTheDocument();
  });

  describe('method is not specified', () => {
    it('should render "None" string', async () => {
      const relayEnvironment = getRelayEnv();
      fillSubscriptionScheduleQuery(relayEnvironment, {
        defaultPaymentMethod: null,
      });
      render(<Component />, { relayEnvironment });
      expect(screen.queryByText(matchTextContent('Owner Visa **** 1234'))).not.toBeInTheDocument();
      expect(screen.getByText('None'));
    });
  });
});
