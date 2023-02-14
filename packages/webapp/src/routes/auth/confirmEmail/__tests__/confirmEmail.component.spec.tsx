import { MockedResponse } from '@apollo/client/testing';
import { screen, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql/error/GraphQLError';
import { produce } from 'immer';
import { append } from 'ramda';
import { Route, Routes } from 'react-router-dom';

import { RoutesConfig } from '../../../../app/config/routes';
import configureStore from '../../../../app/config/store';
import { currentUserFactory } from '../../../../mocks/factories';
import { prepareState } from '../../../../mocks/store';
import { Role } from '../../../../modules/auth/auth.types';
import { fillCommonQueryWithUser } from '../../../../shared/utils/commonQuery';
import { composeMockedQueryResult } from '../../../../tests/utils/fixtures';
import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { ConfirmEmail } from '../confirmEmail.component';
import { authConfirmUserEmailMutation } from '../confirmEmail.graphql';

describe('ConfirmEmail: Component', () => {
  const user = 'user_id';
  const token = 'token';
  const reduxInitialState = prepareState((state) => state);

  const Component = () => (
    <Routes>
      <Route path={RoutesConfig.getLocalePath(['confirmEmail'])} element={<ConfirmEmail />} />
      <Route path={RoutesConfig.getLocalePath(['login'])} element={<span>Login page mock</span>} />
    </Routes>
  );

  describe('token is invalid', () => {
    it('should show error message and redirect to login ', async () => {
      const reduxStore = configureStore(reduxInitialState);
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
        reduxStore,
        routerProps,
        apolloMocks: append(requestMock),
      });
      await waitForApolloMocks();

      expect(reduxStore.getState()).toEqual(
        produce(reduxInitialState, (state) => {
          state.snackbar.lastMessageId = 1;
          state.snackbar.messages = [{ id: 1, text: 'Invalid token.' }];
        })
      );

      expect(await screen.findByText('Login page mock')).toBeInTheDocument();
    });
  });

  describe('token is valid', () => {
    describe('user is logged out', () => {
      it('should show success message and redirect to login ', async () => {
        const reduxStore = configureStore(reduxInitialState);
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

        render(<Component />, { reduxStore, routerProps, apolloMocks: append(requestMock) });

        await waitFor(() => {
          expect(reduxStore.getState()).toEqual(
            produce(reduxInitialState, (state) => {
              state.snackbar.lastMessageId = 1;
              state.snackbar.messages = [{ id: 1, text: 'Congratulations! Now you can log in.' }];
            })
          );
        });

        expect(await screen.findByText('Login page mock')).toBeInTheDocument();
      });
    });

    describe('user is logged in', () => {
      const loggedInReduxState = prepareState((state) => state);

      let apolloMocks: ReadonlyArray<MockedResponse>;

      beforeEach(() => {
        apolloMocks = [
          fillCommonQueryWithUser(
            undefined,
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
        const reduxStore = configureStore(loggedInReduxState);
        const routerProps = createMockRouterProps('confirmEmail', { user, token });

        const { waitForApolloMocks } = render(<Component />, {
          reduxStore,
          routerProps,
          apolloMocks,
        });
        await waitForApolloMocks();

        expect(reduxStore.getState()).toEqual(
          produce(loggedInReduxState, (state) => {
            state.snackbar.lastMessageId = 1;
            state.snackbar.messages = [{ id: 1, text: 'Congratulations! Your email has been confirmed.' }];
          })
        );

        expect(screen.getByText('Login page mock')).toBeInTheDocument();
      });
    });
  });
});
