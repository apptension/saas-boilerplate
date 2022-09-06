import { Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { createMockEnvironment } from 'relay-test-utils';

import { ProvidersWrapper } from '../../../utils/testUtils';
import { currentUserFactory } from '../../../../mocks/factories';
import { fillCommonQueryWithUser } from '../../../utils/commonQuery';
import { Header, HeaderProps } from './header.component';

type StoryArgType = HeaderProps & { isLoggedIn: boolean };

const Template: Story<StoryArgType> = ({ isLoggedIn, ...args }: StoryArgType) => {
  const relayEnvironment = createMockEnvironment();
  fillCommonQueryWithUser(relayEnvironment, isLoggedIn ? currentUserFactory() : null);
  return (
    <ProvidersWrapper
      context={{
        relayEnvironment,
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
