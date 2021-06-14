import React from 'react';
import { Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { ProvidersWrapper } from '../../utils/testUtils';
import { ButtonVariant } from '../button';
import { Link, LinkProps } from './link.component';

const Template: Story<LinkProps> = (args) => {
  return (
    <ProvidersWrapper>
      <Link {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Shared/Link',
  component: Link,
};

const defaultArgs = {
  children: 'Press me',
  onClick: action('Clicked me'),
  variant: ButtonVariant.PRIMARY,
};

export const InternalPrimary = Template.bind({});
InternalPrimary.args = { ...defaultArgs, to: '/internal-route' };

export const ExternalPrimary = Template.bind({});
ExternalPrimary.args = { ...defaultArgs, href: 'http://apptension.com' };

export const InternalSecondary = Template.bind({});
InternalSecondary.args = { ...defaultArgs, to: '/internal-route', variant: ButtonVariant.SECONDARY };

export const ExternalSecondary = Template.bind({});
ExternalSecondary.args = { ...defaultArgs, href: 'http://apptension.com', variant: ButtonVariant.SECONDARY };

export const InternalRaw = Template.bind({});
InternalRaw.args = { ...defaultArgs, to: '/internal-route', variant: ButtonVariant.RAW };

export const ExternalRaw = Template.bind({});
ExternalRaw.args = { ...defaultArgs, href: 'http://apptension.com', variant: ButtonVariant.RAW };
