import { Elements } from '@stripe/react-stripe-js';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { act } from '@testing-library/react';
import { times } from 'ramda';
import { Routes, Route } from 'react-router-dom';

import { EditPaymentMethodForm, EditPaymentMethodFormProps } from '../editPaymentMethodForm.component';
import {
  paymentMethodFactory,
  queueSubscriptionScheduleQuery,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '../../../../../mocks/factories';
import { render } from '../../../../../tests/utils/rendering';
import { fillCommonQueryWithUser } from '../../../../../shared/utils/commonQuery';
import { connectionFromArray } from '../../../../../shared/utils/testUtils';
import { SubscriptionPlanName } from '../../../../../shared/services/api/subscription/types';
import { ActiveSubscriptionContext } from '../../../activeSubscriptionContext/activeSubscriptionContext.component';

const getRelayEnv = () => {
  const relayEnvironment = createMockEnvironment();
  fillCommonQueryWithUser(relayEnvironment);
  return relayEnvironment;
};

describe('EditPaymentMethodForm: Component', () => {
  const defaultProps = {
    onSuccess: () => null,
  };
  const Component = (props: Partial<EditPaymentMethodFormProps>) => (
    <Routes>
      <Route element={<ActiveSubscriptionContext />}>
        <Route
          index
          element={
            <Elements stripe={null}>
              <EditPaymentMethodForm {...defaultProps} {...props} />
            </Elements>
          }
        />
      </Route>
    </Routes>
  );

  it('should render without errors', async () => {
    const relayEnvironment = getRelayEnv();
    render(<Component />, { relayEnvironment });

    await act(() => {
      queueSubscriptionScheduleQuery(relayEnvironment, [
        subscriptionPhaseFactory({
          item: { price: subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } }) },
        }),
      ]);
      relayEnvironment.mock.resolveMostRecentOperation((operation) =>
        MockPayloadGenerator.generate(operation, {
          PaymentMethodConnection: () => connectionFromArray(times(() => paymentMethodFactory(), 2)),
        })
      );
    });
  });
});
