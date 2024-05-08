import { Meta, StoryFn } from '@storybook/react';
import { TenantDangerZone } from './tenantDangerZone.component';

const Template: StoryFn = () => {
  return <TenantDangerZone />;
};

const meta: Meta = {
  title: 'Tenants / TenantDangerZone',
  component: Template,
};

export default meta;
