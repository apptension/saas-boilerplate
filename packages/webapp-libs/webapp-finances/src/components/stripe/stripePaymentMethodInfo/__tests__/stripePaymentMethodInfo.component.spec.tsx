import { useQuery } from '@apollo/client';
import {
  currentUserFactory,
  fillCommonQueryWithUser,
  paymentMethodFactory,
  subscriptionFactory,
  subscriptionPhaseFactory,
} from '@sb/webapp-api-client/tests/factories';
import { matchTextContent } from '@sb/webapp-core/tests/utils/match';
import { mapConnection } from '@sb/webapp-core/utils/graphql';
import { tenantFactory } from '@sb/webapp-tenants/tests/factories/tenant';
import { screen } from '@testing-library/react';
import { append } from 'ramda';

import { fillSubscriptionScheduleQuery, fillSubscriptionScheduleQueryWithPhases } from '../../../../tests/factories';
import { render } from '../../../../tests/utils/rendering';
import { stripeSubscriptionQuery } from '../../stripePaymentMethodSelector';
import { StripePaymentMethodInfo, StripePaymentMethodInfoProps } from '../stripePaymentMethodInfo.component';

const Component = ({ tenantId, ...props }: Partial<StripePaymentMethodInfoProps> & { tenantId: string }) => {
  const { data } = useQuery(stripeSubscriptionQuery, { nextFetchPolicy: 'cache-and-network', variables: { tenantId } });

  const paymentMethods = mapConnection((plan) => plan, data?.allPaymentMethods);
  const firstPaymentMethod = paymentMethods?.[0];

  return <StripePaymentMethodInfo {...props} method={firstPaymentMethod} />;
};

const tenantId = 'tenantId';

describe('StripePaymentMethodInfo: Component', () => {
  const paymentMethods = [paymentMethodFactory()];

  it('should render all info', async () => {
    const tenantMock = fillCommonQueryWithUser(
      currentUserFactory({
        tenants: [
          tenantFactory({
            id: tenantId,
          }),
        ],
      })
    );
    const requestMock = fillSubscriptionScheduleQueryWithPhases([subscriptionPhaseFactory()], paymentMethods, tenantId);

    render(<Component tenantId={tenantId} />, { apolloMocks: [requestMock, tenantMock] });
    expect(await screen.findByText(matchTextContent('MockLastName Visa **** 9999'))).toBeInTheDocument();
  });

  describe('method is not specified', () => {
    it('should render "None" string', async () => {
      const requestMock = fillSubscriptionScheduleQuery(subscriptionFactory());

      render(<Component tenantId={tenantId} />, { apolloMocks: append(requestMock) });
      expect(await screen.findByText('None')).toBeInTheDocument();
    });
  });
});
