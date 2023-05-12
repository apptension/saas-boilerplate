import { action } from '@storybook/addon-actions';
import { StoryFn } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import { ButtonVariant } from '../button';
import { Link, LinkProps } from './link.component';

const Template: StoryFn<LinkProps> = (args: LinkProps) => {
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

export const InternalPrimary = {
  render: Template,
  args: { ...defaultArgs, to: '/internal-route' },
};

export const ExternalPrimary = {
  render: Template,
  args: { ...defaultArgs, href: 'https://apptension.com' },
};

export const InternalSecondary = {
  render: Template,

  args: {
    ...defaultArgs,
    to: '/internal-route',
    variant: ButtonVariant.SECONDARY,
  },
};

export const ExternalSecondary = {
  render: Template,
  args: {
    ...defaultArgs,
    href: 'https://apptension.com',
    variant: ButtonVariant.SECONDARY,
  },
};

export const InternalRaw = {
  render: Template,

  args: {
    ...defaultArgs,
    to: '/internal-route',
    variant: ButtonVariant.RAW,
  },
};

export const ExternalRaw = {
  render: Template,
  args: {
    ...defaultArgs,
    href: 'https://apptension.com',
    variant: ButtonVariant.RAW,
  },
};
