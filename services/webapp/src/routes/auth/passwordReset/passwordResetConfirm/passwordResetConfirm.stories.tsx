import { Story } from '@storybook/react';
import { Route, Routes } from 'react-router';
import { withProviders } from '../../../../shared/utils/storybook';
import { RoutesConfig } from '../../../../app/config/routes';
import { createMockRouterProps } from '../../../../tests/utils/rendering';
import { PasswordResetConfirm } from './passwordResetConfirm.component';

const routePath = ['passwordReset', 'confirm'];
const userParam = 'user';
const tokenParam = 'token';

const Template: Story = () => {
  return (
    <Routes>
      <Route path={RoutesConfig.getLocalePath(routePath)} element={<PasswordResetConfirm />} />
    </Routes>
  );
};

export default {
  title: 'Routes/Auth/PasswordResetConfirm',
  component: PasswordResetConfirm,
};

export const Default = Template.bind({});
Default.decorators = [
  withProviders({
    routerProps: createMockRouterProps(routePath, { user: userParam, token: tokenParam }),
  }),
];
