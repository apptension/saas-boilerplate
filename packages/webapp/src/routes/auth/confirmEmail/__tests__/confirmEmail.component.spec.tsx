import { act, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { produce } from 'immer';
import { MockPayloadGenerator, RelayMockEnvironment } from 'relay-test-utils';

import { ConfirmEmail } from '../confirmEmail.component';
import { RoutesConfig } from '../../../../app/config/routes';
import { prepareState } from '../../../../mocks/store';
import { currentUserFactory } from '../../../../mocks/factories';
import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import configureStore from '../../../../app/config/store';
import { Role } from '../../../../modules/auth/auth.types';
import { getRelayEnv } from '../../../../tests/utils/relay';

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
    let relayEnvironment: RelayMockEnvironment;

    beforeEach(() => {
      relayEnvironment = getRelayEnv();
    });

    it('should redirect to login ', async () => {
      const routerProps = createMockRouterProps('confirmEmail', { user, token });

      render(<Component />, { reduxInitialState, routerProps, relayEnvironment });

      expect(relayEnvironment).toHaveOperation('authConfirmUserEmailMutation');

      await act(async () => {
        const operation = relayEnvironment.mock.getMostRecentOperation();
        relayEnvironment.mock.resolve(operation, {
          ...MockPayloadGenerator.generate(operation),
          errors: [
            {
              message: 'GraphQlValidationError',
              extensions: {
                password: [
                  {
                    message: 'Token is invalid',
                    code: 'invalid',
                  },
                ],
              },
            },
          ],
        } as any);
      });

      expect(screen.getByText('Login page mock')).toBeInTheDocument();
    });

    it('should show error message', async () => {
      const reduxStore = configureStore(reduxInitialState);
      const routerProps = createMockRouterProps('confirmEmail', { user, token });

      render(<Component />, { reduxStore, routerProps, relayEnvironment });

      expect(relayEnvironment).toHaveOperation('authConfirmUserEmailMutation');

      await act(async () => {
        const operation = relayEnvironment.mock.getMostRecentOperation();
        relayEnvironment.mock.resolve(operation, {
          ...MockPayloadGenerator.generate(operation),
          errors: [
            {
              message: 'GraphQlValidationError',
              extensions: {
                password: [
                  {
                    message: 'Token is invalid',
                    code: 'invalid',
                  },
                ],
              },
            },
          ],
        } as any);
      });

      expect(reduxStore.getState()).toEqual(
        produce(reduxInitialState, (state) => {
          state.snackbar.lastMessageId = 1;
          state.snackbar.messages = [{ id: 1, text: 'Invalid token.' }];
        })
      );
    });
  });

  describe('token is valid', () => {
    let relayEnvironment: RelayMockEnvironment;

    beforeEach(() => {
      relayEnvironment = getRelayEnv();
    });

    describe('user is logged out', () => {
      it('should redirect to login ', async () => {
        const routerProps = createMockRouterProps('confirmEmail', { user, token });

        render(<Component />, { reduxInitialState, routerProps, relayEnvironment });

        await act(async () => {
          const operation = relayEnvironment.mock.getMostRecentOperation();
          relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
        });

        expect(screen.getByText('Login page mock')).toBeInTheDocument();
      });

      it('should show success message', async () => {
        const reduxStore = configureStore(reduxInitialState);
        const routerProps = createMockRouterProps('confirmEmail', { user, token });

        render(<Component />, { reduxStore, routerProps, relayEnvironment });
        await act(async () => {
          const operation = relayEnvironment.mock.getMostRecentOperation();
          relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
        });

        expect(reduxStore.getState()).toEqual(
          produce(reduxInitialState, (state) => {
            state.snackbar.lastMessageId = 1;
            state.snackbar.messages = [{ id: 1, text: 'Congratulations! Now you can log in.' }];
          })
        );
      });
    });

    describe('user is logged in', () => {
      const loggedInReduxState = prepareState((state) => state);

      let relayEnvironment: RelayMockEnvironment;

      beforeEach(() => {
        relayEnvironment = getRelayEnv(
          currentUserFactory({
            roles: [Role.ADMIN],
          })
        );
      });

      it('should redirect to login ', async () => {
        const routerProps = createMockRouterProps('confirmEmail', { user, token });

        render(<Component />, { reduxInitialState: loggedInReduxState, routerProps, relayEnvironment });

        expect(relayEnvironment).toHaveOperation('authConfirmUserEmailMutation');

        await act(async () => {
          const operation = relayEnvironment.mock.getMostRecentOperation();
          relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
        });

        expect(screen.getByText('Login page mock')).toBeInTheDocument();
      });

      it('should show success message', async () => {
        const reduxStore = configureStore(loggedInReduxState);
        const routerProps = createMockRouterProps('confirmEmail', { user, token });

        render(<Component />, { reduxStore, routerProps, relayEnvironment });

        expect(relayEnvironment).toHaveOperation('authConfirmUserEmailMutation');

        await act(async () => {
          const operation = relayEnvironment.mock.getMostRecentOperation();
          relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
        });

        expect(reduxStore.getState()).toEqual(
          produce(loggedInReduxState, (state) => {
            state.snackbar.lastMessageId = 1;
            state.snackbar.messages = [{ id: 1, text: 'Congratulations! Your email has been confirmed.' }];
          })
        );
      });
    });
  });
});
