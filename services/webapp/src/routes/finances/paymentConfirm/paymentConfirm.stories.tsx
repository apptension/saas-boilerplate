import { Story } from '@storybook/react';
import { withRedux } from '../../../shared/utils/storybook';
import { withRouter } from '../../../../.storybook/decorators';
import { PaymentConfirm } from './paymentConfirm.component';

const Template: Story = () => {
  return <PaymentConfirm />;
};

export default {
  title: 'Routes/Finances/PaymentConfirm',
  component: PaymentConfirm,
  decorators: [withRedux(), withRouter()],
};

export const Default = Template.bind({});
Default.args = {};
