import { getLocalePath } from '@sb/webapp-core/utils';
import { StoryFn } from '@storybook/react';
import { Route, Routes } from 'react-router';

import { RoutesConfig } from '../../../../app/config/routes';
import { withProviders } from '../../../../shared/utils/storybook';
import { createMockRouterProps } from '../../../../tests/utils/rendering';
import { PasswordResetConfirm } from './passwordResetConfirm.component';

const routePath = RoutesConfig.passwordReset.confirm;
const userParam = 'user';
const tokenParam = 'token';

const Template: StoryFn = () => {
  return (
    <Routes>
      <Route path={getLocalePath(routePath)} element={<PasswordResetConfirm />} />
    </Routes>
  );
};

export default {
  title: 'Routes/Auth/PasswordResetConfirm',
  component: PasswordResetConfirm,
};

export const Default = {
  render: Template,

  decorators: [
    withProviders({
      routerProps: createMockRouterProps(routePath, {
        user: userParam,
        token: tokenParam,
      }),
    }),
  ],
};
