import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { withProviders } from '../../utils/storybook';
import { TenantDangerZone } from './tenantDangerZone.component';

const Template: StoryFn = () => {
  return <TenantDangerZone />;
};

const meta: Meta = {
  title: 'Tenants / TenantDangerZone',
  component: Template,
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: Template,
  decorators: [withProviders({})],
};
