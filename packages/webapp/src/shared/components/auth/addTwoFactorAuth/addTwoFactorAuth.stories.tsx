import { Story } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import { AddTwoFactorAuth, AddTwoFactorAuthProps } from './addTwoFactorAuth.component';

const Template: Story<AddTwoFactorAuthProps> = (args) => {
  return <AddTwoFactorAuth {...args} />;
};

export default {
  title: 'Shared/Auth/AddTwoFactorAuth',
  component: AddTwoFactorAuth,
};

export const Default = Template.bind({});

Default.args = {};
Default.decorators = [withProviders({})];
