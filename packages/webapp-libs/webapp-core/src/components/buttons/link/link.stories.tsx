import { action } from '@storybook/addon-actions';

import { withProviders } from '../../../utils/storybook';
import { ButtonVariant } from '../button';
import { Link, LinkProps } from './link.component';

const Template: Story<LinkProps> = (args: LinkProps) => {
  return <Link {...args} />;
};

export default {
  title: 'Core/Link',
  component: Link,
  decorators: [withProviders()],
};

const defaultArgs = {
  children: 'Press me',
  onClick: action('Clicked me'),
  variant: ButtonVariant.PRIMARY,
};

export const InternalPrimary = Template.bind({});
InternalPrimary.args = { ...defaultArgs, to: '/internal-route' };

export const ExternalPrimary = Template.bind({});
ExternalPrimary.args = { ...defaultArgs, href: 'https://apptension.com' };

export const InternalSecondary = Template.bind({});
InternalSecondary.args = {
  ...defaultArgs,
  to: '/internal-route',
  variant: ButtonVariant.SECONDARY,
};

export const ExternalSecondary = Template.bind({});
ExternalSecondary.args = { ...defaultArgs, href: 'https://apptension.com', variant: ButtonVariant.SECONDARY };

export const InternalRaw = Template.bind({});
InternalRaw.args = {
  ...defaultArgs,
  to: '/internal-route',
  variant: ButtonVariant.RAW,
};

export const ExternalRaw = Template.bind({});
ExternalRaw.args = { ...defaultArgs, href: 'https://apptension.com', variant: ButtonVariant.RAW };
