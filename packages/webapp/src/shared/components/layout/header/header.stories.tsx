import { currentUserFactory } from '@sb/webapp-api-client/tests/factories';
import { action } from '@storybook/addon-actions';
import { Story } from '@storybook/react';

import { fillCommonQueryWithUser } from '../../../../tests/factories';
import { withProviders } from '../../../utils/storybook';
import { Header, HeaderProps } from './header.component';

type StoryArgType = HeaderProps & { isLoggedIn: boolean };

const Template: Story<StoryArgType> = ({ isLoggedIn, ...args }: StoryArgType) => {
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

export const LoggedOut = Template.bind({});
LoggedOut.args = { isLoggedIn: false };

export const LoggedIn = Template.bind({});
LoggedIn.args = { isLoggedIn: true, onClick: action('Menu open') };
