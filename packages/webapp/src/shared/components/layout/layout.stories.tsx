import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { fillNotificationsListQuery } from '@sb/webapp-notifications/tests/factories';
import { StoryFn } from '@storybook/react';
import styled from 'styled-components';

import { withProviders } from '../../utils/storybook';
import { Layout, LayoutProps } from './layout.component';

const MockContent = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: lightgray;
`;

type StoryArgType = LayoutProps & { isLoggedIn: boolean };

const Template: StoryFn<StoryArgType> = ({ isLoggedIn, ...args }: StoryArgType) => {
  return <Layout {...args} />;
};

export default {
  title: 'Shared/Layout',
  component: Layout,
  decorators: [
    withProviders({
      apolloMocks: (defaultMocks, { args: { isLoggedIn } }: any) => [
        fillCommonQueryWithUser(isLoggedIn ? currentUserFactory() : null),
        fillNotificationsListQuery([], { hasUnreadNotifications: false }),
      ],
    }),
  ],
};

export const LoggedOut = {
  render: Template,
  args: { isLoggedIn: false, children: <MockContent /> },
};

export const LoggedIn = {
  render: Template,
  args: { isLoggedIn: true, children: <MockContent /> },
};
