import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { withProviders } from '../../utils/storybook';
import { TenantForm, TenantFormProps } from './tenantForm.component';

const Template: StoryFn<TenantFormProps> = (args: TenantFormProps) => {
  return <TenantForm {...args} />;
};

const meta: Meta = {
  title: 'Tenants / TenantForm',
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
