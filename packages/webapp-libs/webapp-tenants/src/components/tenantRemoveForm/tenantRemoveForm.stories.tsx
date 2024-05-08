import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { withProviders } from '../../utils/storybook';
import { TenantRemoveForm, TenantRemoveFormProps } from './tenantRemoveForm.component';

const Template: StoryFn<TenantRemoveFormProps> = (args: TenantRemoveFormProps) => {
  return <TenantRemoveForm {...args} />;
};

const meta: Meta = {
  title: 'Tenants / TenantRemoveForm',
  component: Template,
};

export default meta;

export const WithInitialData: StoryObj<typeof meta> = {
  args: {
    initialData: {
      name: 'initial name',
    },
  },

  decorators: [withProviders({})],
};

export const WithoutData: StoryObj<typeof meta> = {
  decorators: [withProviders({})],
};
