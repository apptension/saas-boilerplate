import { Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { ProvidersWrapper } from '../../../utils/testUtils';
import { loggedInAuthFactory, loggedOutAuthFactory } from '../../../../mocks/factories';
import { Header, HeaderProps } from './header.component';

const loggedInAuthState = loggedInAuthFactory();
const loggedOutAuthState = loggedOutAuthFactory();

type StoryArgType = HeaderProps & { isLoggedIn: boolean };

const Template: Story<StoryArgType> = ({ isLoggedIn, ...args }: StoryArgType) => {
  return (
    <ProvidersWrapper
      context={{
        store: (state) => {
          state.auth = isLoggedIn ? loggedInAuthState : loggedOutAuthState;
        },
      }}
    >
      <Header {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Shared/Layout/Header',
  component: Header,
};

export const LoggedOut = Template.bind({});
LoggedOut.args = { isLoggedIn: false };

export const LoggedIn = Template.bind({});
LoggedIn.args = { isLoggedIn: true, onClick: action('Menu open') };
