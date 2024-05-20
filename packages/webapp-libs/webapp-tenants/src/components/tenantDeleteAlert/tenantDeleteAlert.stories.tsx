import { action } from '@storybook/addon-actions';
import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { withProviders } from '../../utils/storybook';
import { TenantDeleteAlert, TenantDeleteAlertProps } from './tenantDeleteAlert.component';

const defaultProps: TenantDeleteAlertProps = {
  disabled: false,
  onContinue: action('TenantDelete mutation'),
};

const Template: StoryFn<TenantDeleteAlertProps> = (args: TenantDeleteAlertProps) => {
  return <TenantDeleteAlert {...args} />;
};

const meta: Meta = {
  title: 'Tenants / TenantDeleteAlert',
  component: Template,
};

export default meta;

export const Enabled: StoryObj<typeof meta> = {
  decorators: [withProviders({})],
};

export const Disabled: StoryObj<typeof meta> = {
  args: {
    ...defaultProps,
    disabled: true,
  },
  decorators: [withProviders({})],
};
