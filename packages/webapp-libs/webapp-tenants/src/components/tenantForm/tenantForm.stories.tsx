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

export const CreateMode: StoryObj<typeof meta> = {
  args: {
    submitLabel: 'Create organization',
  },
  decorators: [withProviders({})],
};

export const HiddenCancel: StoryObj<typeof meta> = {
  args: {
    hideCancel: true,
    initialData: {
      name: 'Test organization',
    },
  },
  decorators: [withProviders({})],
};
