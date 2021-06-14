import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import { Layout } from '../layout.component';
import { makeContextRenderer, spiedHistory } from '../../../shared/utils/testUtils';
import { Breakpoint } from '../../../theme/media';
import { prepareState } from '../../../mocks/store';
import { loggedInAuthFactory } from '../../../mocks/factories';
import { ROUTES } from '../../app.constants';

const loggedInState = prepareState((state) => {
  state.auth = loggedInAuthFactory();
});

const mockGetActiveBreakpoint = jest.fn().mockReturnValue(Breakpoint.DESKTOP);
jest.mock('../../../theme/media', () => {
  return {
    ...jest.requireActual<NodeModule>('../../../theme/media'),
    getActiveBreakpoint: () => mockGetActiveBreakpoint(),
  };
});

describe('Layout: Component', () => {
  const component = () => (
    <Layout>
      <span data-testid="content" />
    </Layout>
  );
  const render = makeContextRenderer(component);

  describe('on mobile', () => {
    beforeEach(() => {
      mockGetActiveBreakpoint.mockReturnValue(Breakpoint.MOBILE);
    });

    describe('on /auth routes', () => {
      it('should not show open menu button', () => {
        render({}, { router: { routePath: `/:lang${ROUTES.login}` } });
        expect(screen.queryByLabelText(/open menu/gi)).not.toBeInTheDocument();
      });
    });

    it('should show content', () => {
      render();
      expect(screen.getByTestId('content')).toBeVisible();
    });

    describe('user is logged out', () => {
      it('should show open menu button', () => {
        render();
        expect(screen.queryByLabelText(/open menu/gi)).toBeInTheDocument();
      });

      it('should show privacy menu link', () => {
        render();
        expect(screen.queryByText(/privacy policy/gi)).toBeInTheDocument();
      });

      it('should not show dashboard menu link', () => {
        render();
        expect(screen.queryByText(/dashboard/gi)).not.toBeInTheDocument();
      });
    });

    describe('user is logged in', () => {
      it('should show open menu button', () => {
        render({}, { store: loggedInState });
        expect(screen.getByLabelText(/open menu/gi)).toBeVisible();
      });

      it('should not show menu links', () => {
        render({}, { store: loggedInState });
        expect(screen.queryByText(/privacy policy/gi)).not.toBeVisible();
      });

      describe('user opens the menu', () => {
        it('should show menu links', () => {
          const { history, pushSpy } = spiedHistory();
          render({}, { router: { history }, store: loggedInState });
          userEvent.click(screen.getByLabelText(/open menu/gi));
          userEvent.click(screen.getByText(/privacy policy/gi));
          expect(pushSpy).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/en/privacy-policy' }));
        });

        it('should close the menu when link is clicked', async () => {
          render({}, { store: loggedInState });
          userEvent.click(screen.getByLabelText(/open menu/gi));
          userEvent.click(screen.getByText(/privacy policy/gi));

          await waitFor(() => {
            expect(screen.queryByText(/privacy policy/gi)).not.toBeVisible();
          });
        });

        it('should close the menu when close icon is clicked', async () => {
          render({}, { store: loggedInState });
          userEvent.click(screen.getByLabelText(/open menu/gi));
          userEvent.click(screen.getByLabelText(/close menu/gi));
          expect(screen.queryByText(/privacy policy/gi)).not.toBeVisible();
        });
      });
    });
  });

  describe('on desktop', () => {
    beforeEach(() => {
      mockGetActiveBreakpoint.mockReturnValue(Breakpoint.DESKTOP);
    });

    it('should show content', () => {
      render();
      expect(screen.getByTestId('content')).toBeVisible();
    });

    describe('on /auth routes', () => {
      it('should not show menu links', () => {
        render({}, { router: { routePath: `/:lang${ROUTES.login}` } });
        expect(screen.queryByText(/privacy policy/gi)).not.toBeInTheDocument();
      });
    });

    describe('user is logged out', () => {
      it('should not show open menu button', () => {
        render();
        expect(screen.queryByLabelText(/open menu/gi)).not.toBeInTheDocument();
      });

      it('should show menu links', () => {
        render();
        expect(screen.queryByText(/privacy policy/gi)).toBeInTheDocument();
      });
    });

    describe('user is logged in', () => {
      it('should not show open menu button', () => {
        render({}, { store: loggedInState });
        expect(screen.queryByLabelText(/open menu/gi)).not.toBeInTheDocument();
      });

      it('should show menu links', () => {
        const { history, pushSpy } = spiedHistory();
        render({}, { router: { history }, store: loggedInState });
        userEvent.click(screen.getByText(/privacy policy/gi));
        expect(pushSpy).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/en/privacy-policy' }));
      });
    });
  });
});
