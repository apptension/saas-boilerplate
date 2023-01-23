import { useActiveSubscriptionDetailsQueryRef } from '../../activeSubscriptionContext/activeSubscriptionContext.hooks';
import { EditPaymentMethodFormContentProps, EditPaymentMethodContentForm } from './editPaymentMethodForm.content';

export type EditPaymentMethodFormProps = Omit<EditPaymentMethodFormContentProps, 'activeSubscriptionQueryRef'>;

export const EditPaymentMethodForm = (props: EditPaymentMethodFormProps) => {
  const activeSubscriptionDetailsQueryRefContext = useActiveSubscriptionDetailsQueryRef();

  if (!activeSubscriptionDetailsQueryRefContext || !activeSubscriptionDetailsQueryRefContext.ref) return null;

  return (
    <EditPaymentMethodContentForm
      {...props}
      activeSubscriptionQueryRef={activeSubscriptionDetailsQueryRefContext.ref}
    />
  );
};
