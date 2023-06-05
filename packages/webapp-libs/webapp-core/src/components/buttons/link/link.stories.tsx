import { action } from '@storybook/addon-actions';
import { Meta, StoryObj } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import { ButtonVariant } from '../button';
import { Link } from './link.component';

type Story = StoryObj<typeof Link>;

const meta: Meta<typeof Link> = {
  title: 'Core/Link',
  component: Link,
  decorators: [withProviders()],
};

export default meta;

const defaultArgs = {
  children: 'Press me',
  onClick: action('Clicked me'),
};

export const InternalPrimary: Story = {
  args: { ...defaultArgs, to: '/internal-route', variant: ButtonVariant.PRIMARY },
};

export const ExternalPrimary: Story = {
  args: { ...defaultArgs, href: 'https://apptension.com', variant: ButtonVariant.PRIMARY },
};

export const InternalSecondary: Story = {
  args: {
    ...defaultArgs,
    to: '/internal-route',
    variant: ButtonVariant.SECONDARY,
  },
};

export const ExternalSecondary: Story = {
  args: {
    ...defaultArgs,
    href: 'https://apptension.com',
    variant: ButtonVariant.SECONDARY,
  },
};

export const InternalRaw: Story = {
  args: {
    ...defaultArgs,
    to: '/internal-route',
    variant: ButtonVariant.GHOST,
  },
};

export const ExternalRaw: Story = {
  args: {
    ...defaultArgs,
    href: 'https://apptension.com',
    variant: ButtonVariant.GHOST,
  },
};
