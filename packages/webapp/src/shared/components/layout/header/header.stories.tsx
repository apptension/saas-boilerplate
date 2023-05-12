import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { action } from '@storybook/addon-actions';
import { StoryFn } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import { Header, HeaderProps } from './header.component';

type StoryArgType = HeaderProps & { isLoggedIn: boolean };

const Template: StoryFn<StoryArgType> = ({ isLoggedIn, ...args }: StoryArgType) => {
  return <Header {...args} />;
};

export default {
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

export const LoggedOut = {
  render: Template,
  args: { isLoggedIn: false },
};

export const LoggedIn = {
  render: Template,
  args: { isLoggedIn: true, onClick: action('Menu open') },
};
