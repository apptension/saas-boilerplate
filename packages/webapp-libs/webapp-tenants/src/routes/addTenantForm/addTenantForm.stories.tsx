import { StoryFn, StoryObj } from '@storybook/react';

import { withProviders } from '../../utils/storybook';
import { AddTenantForm } from './addTenantForm.component';

const Template: StoryFn = () => {
  return <AddTenantForm />;
};

export default {
  title: 'Tenants / AddTenant',
  component: AddTenantForm,
};

export const Default: StoryObj = {
  render: Template,
  decorators: [withProviders({})],
};
