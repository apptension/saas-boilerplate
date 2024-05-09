import { action } from '@storybook/addon-actions';
import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import { DangerZoneItem, DangerZoneItemProps } from './dangerZoneItem.component';

const defaultProps: DangerZoneItemProps = {
  buttonText: 'Button text',
  title: 'Title',
  subtitle: 'subtitle',
  onClick: action('Button Clicked'),
};

const Template: StoryFn<DangerZoneItemProps> = (args: DangerZoneItemProps) => {
  return <DangerZoneItem {...args} />;
};

const meta: Meta = {
  title: 'Tenants / TenantDangerZone / Item',
  component: Template,
};

export default meta;

export const Disabled: StoryObj<DangerZoneItemProps> = {
  args: {
    ...defaultProps,
    disabled: true,
  },
  decorators: [withProviders({})],
};

export const Enabled: StoryObj<DangerZoneItemProps> = {
  args: {
    ...defaultProps,
    disabled: false,
  },
  decorators: [withProviders({})],
};
