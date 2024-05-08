import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions'

import { ApolloError } from '@apollo/client';
import { withProviders } from '../../utils/storybook';
import { TenantRemoveForm, TenantRemoveFormProps } from './tenantRemoveForm.component';

const Template: StoryFn<TenantRemoveFormProps> = (args: TenantRemoveFormProps) => {
  return <TenantRemoveForm {...args}
    onSubmit={action('Remove tenant')}
  />;
};

const meta: Meta = {
  title: 'Tenants / TenantRemoveForm',
  component: Template,
};

export default meta;

export const Error: StoryObj<TenantRemoveFormProps> = {
  args: {
    error: { message: "Error message" } as ApolloError
  },
  decorators: [withProviders({})],
};

export const Loading: StoryObj<TenantRemoveFormProps> = {
  args: {
    loading: true
  },
  decorators: [withProviders({})],
};
