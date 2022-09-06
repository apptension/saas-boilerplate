import { Story } from '@storybook/react';
import styled from 'styled-components';
import { createMockEnvironment } from 'relay-test-utils';

import { currentUserFactory } from '../../../mocks/factories';
import { withRouter } from '../../../../.storybook/decorators';
import { fillCommonQueryWithUser } from '../../utils/commonQuery';
import { Layout, LayoutProps } from './layout.component';

const MockContent = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: lightgray;
`;

type StoryArgType = LayoutProps & { isLoggedIn: boolean };

const Template: Story<StoryArgType> = ({ isLoggedIn, ...args }: StoryArgType) => {
  const relayEnvironment = createMockEnvironment();
  fillCommonQueryWithUser(relayEnvironment, isLoggedIn ? currentUserFactory() : null);
  return <Layout {...args} />;
};

export default {
  title: 'Shared/Layout',
  component: Layout,
};

export const LoggedOut = Template.bind({});
LoggedOut.args = { isLoggedIn: false, children: <MockContent /> };
LoggedOut.decorators = [withRouter()];

export const LoggedIn = Template.bind({});
LoggedIn.args = { isLoggedIn: true, children: <MockContent /> };
LoggedIn.decorators = [withRouter()];
