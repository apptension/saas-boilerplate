import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { fillNotificationsListQuery } from '@sb/webapp-notifications/tests/factories';
import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { styled } from 'styled-components';

import { withProviders } from '../../utils/storybook';
import { Layout } from './layout.component';

const MockContent = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: lightgray;
`;

const Template: StoryFn = ({ isLoggedIn, ...args }) => {
  return (
    <Layout {...args}>
      <MockContent />
    </Layout>
  );
};

const meta: Meta = {
  title: 'Shared/Layout',
  component: Layout,
  decorators: [
    withProviders({
      apolloMocks: (defaultMocks, { args: { isLoggedIn = false } }: any) => {
        return [
          fillCommonQueryWithUser(isLoggedIn ? currentUserFactory() : null),
          fillNotificationsListQuery([], { hasUnreadNotifications: false }),
        ];
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
  args: { isLoggedIn: true },
};
