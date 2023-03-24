import { MockedResponse } from '@apollo/client/testing';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { screen } from '@testing-library/react';
import { GraphQLError } from 'graphql/error/GraphQLError';
import { append } from 'ramda';
import { Route, Routes } from 'react-router-dom';

import { RoutesConfig } from '../../../../app/config/routes';
import { Role } from '../../../../modules/auth/auth.types';
import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { ConfirmEmail } from '../confirmEmail.component';
import { authConfirmUserEmailMutation } from '../confirmEmail.graphql';

jest.mock('@sb/webapp-core/services/analytics');

describe('ConfirmEmail: Component', () => {
  const user = 'user_id';
  const token = 'token';

  const Component = () => (
    <Routes>
      <Route path={RoutesConfig.getLocalePath(['confirmEmail'])} element={<ConfirmEmail />} />
      <Route path={RoutesConfig.getLocalePath(['login'])} element={<span>Login page mock</span>} />
    </Routes>
  );

  describe('token is invalid', () => {
    it('should show error message and redirect to login ', async () => {
      const routerProps = createMockRouterProps('confirmEmail', { user, token });
      const requestMock = composeMockedQueryResult(authConfirmUserEmailMutation, {
        variables: {
          input: { user, token },
        },
        data: {},
        errors: [
          new GraphQLError('GraphQlValidationError', {
            extensions: {
              password: [
                {
                  message: 'Token is invalid',
                  code: 'invalid',
                },
              ],
            },
          }),
        ],
      });

      const { waitForApolloMocks } = render(<Component />, {
        routerProps,
        apolloMocks: append(requestMock),
      });

      await waitForApolloMocks();

      const message = await screen.findByTestId('snackbar-message-1');
      expect(message).toHaveTextContent('Invalid token.');

      expect(await screen.findByText('Login page mock')).toBeInTheDocument();
    });
  });

  describe('token is valid', () => {
    describe('user is logged out', () => {
      it('should show success message and redirect to login ', async () => {
        const routerProps = createMockRouterProps('confirmEmail', { user, token });

        const requestMock = composeMockedQueryResult(authConfirmUserEmailMutation, {
          variables: {
            input: { user, token },
          },
          data: {
            confirm: {
              ok: true,
            },
          },
        });

        render(<Component />, {
          routerProps,
          apolloMocks: append(requestMock),
        });

        const message = await screen.findByTestId('snackbar-message-1');
        expect(message).toHaveTextContent('Congratulations! Now you can log in.');

        expect(await screen.findByText('Login page mock')).toBeInTheDocument();
      });
    });

    describe('user is logged in', () => {
      let apolloMocks: ReadonlyArray<MockedResponse>;

      beforeEach(() => {
        apolloMocks = [
          fillCommonQueryWithUser(
            currentUserFactory({
              roles: [Role.ADMIN],
            })
          ),
          composeMockedQueryResult(authConfirmUserEmailMutation, {
            variables: {
              input: { user, token },
            },
            data: {
              confirm: {
                ok: true,
              },
            },
          }),
        ];
      });

      it('should show success message and redirect to login ', async () => {
        const routerProps = createMockRouterProps('confirmEmail', { user, token });

        const { waitForApolloMocks } = render(<Component />, {
          routerProps,
          apolloMocks,
        });

        await waitForApolloMocks();

        const message = await screen.findByTestId('snackbar-message-1');
        expect(message).toHaveTextContent('Congratulations! Your email has been confirmed.');
        expect(trackEvent).toHaveBeenCalledWith('auth', 'user-email-confirm');

        expect(screen.getByText('Login page mock')).toBeInTheDocument();
      });
    });
  });
});
