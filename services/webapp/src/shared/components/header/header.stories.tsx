import React from 'react';
import { Story } from '@storybook/react';

import { action } from '@storybook/addon-actions';
import { ProvidersWrapper } from '../../utils/testUtils';
import { prepareState } from '../../../mocks/store';
import { loggedInAuthFactory, loggedOutAuthFactory } from '../../../mocks/factories';
import { Header } from './header.component';

const loggedInAuthState = loggedInAuthFactory();
const loggedOutAuthState = loggedOutAuthFactory();

const Template: Story = ({ isLoggedIn, ...args }) => {
  const store = prepareState((state) => {
    state.auth = isLoggedIn ? loggedInAuthState : loggedOutAuthState;
  });
  return (
    <ProvidersWrapper context={{ store }}>
      <Header {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Shared/Header',
  component: Header,
};

export const LoggedOut = Template.bind({});
LoggedOut.args = { isLoggedIn: false };

export const LoggedIn = Template.bind({});
LoggedIn.args = { isLoggedIn: true, onMenuOpenClick: action('Menu open') };
