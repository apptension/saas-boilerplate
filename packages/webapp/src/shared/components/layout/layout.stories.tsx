import { Story } from '@storybook/react';
import styled from 'styled-components';

import { currentUserFactory, fillNotificationsListQuery } from '../../../mocks/factories';
import { fillCommonQueryWithUser } from '../../utils/commonQuery';
import { withProviders } from '../../utils/storybook';
import { Layout, LayoutProps } from './layout.component';

const MockContent = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: lightgray;
`;

type StoryArgType = LayoutProps & { isLoggedIn: boolean };

const Template: Story<StoryArgType> = ({ isLoggedIn, ...args }: StoryArgType) => {
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

export const LoggedOut = Template.bind({});
LoggedOut.args = { isLoggedIn: false, children: <MockContent /> };

export const LoggedIn = Template.bind({});
LoggedIn.args = { isLoggedIn: true, children: <MockContent /> };
