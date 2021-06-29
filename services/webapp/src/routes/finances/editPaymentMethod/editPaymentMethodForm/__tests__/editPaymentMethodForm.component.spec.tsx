import { Elements } from '@stripe/react-stripe-js';
import { produce } from 'immer';
import { times } from 'ramda';
import { makeContextRenderer } from '../../../../../shared/utils/testUtils';
import { EditPaymentMethodForm, EditPaymentMethodFormProps } from '../editPaymentMethodForm.component';
import { store } from '../../../../../mocks/store';
import { paymentMethodFactory } from '../../../../../mocks/factories';

describe('EditPaymentMethodForm: Component', () => {
  const defaultProps = {
    onSuccess: () => null,
  };
  const component = (props: Partial<EditPaymentMethodFormProps>) => (
    <Elements stripe={null}>
      <EditPaymentMethodForm {...defaultProps} {...props} />
    </Elements>
  );
  const render = makeContextRenderer(component);

  it('should render without errors', () => {
    render(
      {},
      {
        store: produce(store, (state) => {
          state.stripe.paymentMethods = times(() => paymentMethodFactory(), 2);
        }),
      }
    );
  });
});
