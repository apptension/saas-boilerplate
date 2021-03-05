import React from 'react';
import { Story } from '@storybook/react';
import styled from 'styled-components';

import { withRedux } from '../../shared/utils/storybook';
import { prepareState } from '../../mocks/store';
import { loggedInAuthFactory } from '../../mocks/factories';
import { withRouter } from '../../../.storybook/decorators';
import { Layout, LayoutProps } from './layout.component';

const MockContent = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: lightgray;
`;

const loggedInStore = prepareState((state) => {
  state.auth = loggedInAuthFactory();
});

const Template: Story<LayoutProps> = (args) => {
  return <Layout {...args} />;
};

export default {
  title: 'Shared/Layout',
  component: Layout,
};

export const LoggedOut = Template.bind({});
LoggedOut.args = { children: <MockContent /> };
LoggedOut.decorators = [withRedux(), withRouter()];

export const LoggedIn = Template.bind({});
LoggedIn.args = { children: <MockContent /> };
LoggedIn.decorators = [withRedux(loggedInStore), withRouter()];
