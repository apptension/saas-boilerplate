import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { action } from '@storybook/addon-actions';
import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import { Header } from './header.component';

const Template: StoryFn = ({ isLoggedIn, ...args }) => {
  return <Header {...args} />;
};

const meta: Meta = {
  title: 'Shared/Layout/Header',
  component: Header,
  decorators: [
    withProviders({
      apolloMocks: (defaultMocks, { args: { isLoggedIn = false } }: any) => {
        return [fillCommonQueryWithUser(isLoggedIn ? currentUserFactory() : null)];
      },
    }),
  ],
};

export default meta;

export const LoggedOut: StoryObj<typeof meta> = {
  render: Template,
  args: { isLoggedIn: false },
};

export const LoggedIn: StoryObj<typeof meta> = {
  render: Template,
  args: { isLoggedIn: true, onClick: action('Menu open') },
};
