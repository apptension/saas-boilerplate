import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { Layout } from '../layout.component';
import {makeContextRenderer, packHistoryArgs, spiedHistory} from '../../../utils/testUtils';
import { Breakpoint } from '../../../../theme/media';
import { prepareState } from '../../../../mocks/store';
import { loggedInAuthFactory } from '../../../../mocks/factories';
import { Routes } from '../../../../app/config/routes';

const loggedInState = prepareState((state) => {
  state.auth = loggedInAuthFactory();
});

const mockGetActiveBreakpoint = jest.fn().mockReturnValue(Breakpoint.DESKTOP);
jest.mock('../../../../theme/media', () => {
  return {
    ...jest.requireActual<NodeModule>('../../../../theme/media'),
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
        render({}, { router: { routePath: `/:lang${Routes.login}` } });
        expect(screen.queryByLabelText(/open menu/i)).not.toBeInTheDocument();
      });
    });

    it('should show content', () => {
      render();
      expect(screen.getByTestId('content')).toBeVisible();
    });

    describe('user is logged out', () => {
      it('should show open menu button', () => {
        render();
        expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument();
      });

      it('should show privacy menu link', () => {
        render();
        expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
      });

      it('should not show dashboard menu link', () => {
        render();
        expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
      });
    });

    describe('user is logged in', () => {
      it('should show open menu button', () => {
        render({}, { store: loggedInState });
        expect(screen.getByLabelText(/open menu/i)).toBeVisible();
      });

      it('should not show menu links', () => {
        render({}, { store: loggedInState });
        expect(screen.queryByText(/privacy policy/i)).not.toBeVisible();
      });

      describe('user opens the menu', () => {
        it('should show menu links', async () => {
          const { history, pushSpy } = spiedHistory();
          render({}, { router: { history }, store: loggedInState });
          await userEvent.click(screen.getByLabelText(/open menu/i));
          await userEvent.click(screen.getByText(/privacy policy/i));
          expect(pushSpy).toHaveBeenCalledWith(...packHistoryArgs('/en/privacy-policy'));
        });

        it('should close the menu when link is clicked', async () => {
          const routePath = Routes.getLocalePath(['privacyPolicy']);
          const { history } = spiedHistory('/en/privacy-policy');
          render({}, { store: loggedInState, router: { history, routePath } });
          await userEvent.click(screen.getByLabelText(/open menu/i));
          await userEvent.click(screen.getByText(/privacy policy/i));

          await waitFor(() => {
            expect(screen.queryByText(/privacy policy/i)).not.toBeVisible();
          });
        });

        it('should close the menu when close icon is clicked', async () => {
          render({}, { store: loggedInState });
          await userEvent.click(screen.getByLabelText(/open menu/i));
          await userEvent.click(screen.getByLabelText(/close menu/i));
          expect(screen.queryByText(/privacy policy/i)).not.toBeVisible();
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
        render({}, { router: { routePath: `/:lang${Routes.login}` } });
        expect(screen.queryByText(/privacy policy/i)).not.toBeInTheDocument();
      });
    });

    describe('user is logged out', () => {
      it('should not show open menu button', () => {
        render();
        expect(screen.queryByLabelText(/open menu/i)).not.toBeInTheDocument();
      });

      it('should show menu links', () => {
        render();
        expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
      });
    });

    describe('user is logged in', () => {
      it('should not show open menu button', () => {
        render({}, { store: loggedInState });
        expect(screen.queryByLabelText(/open menu/i)).not.toBeInTheDocument();
      });

      it('should show menu links', async () => {
        const { history, pushSpy } = spiedHistory();
        render({}, { router: { history }, store: loggedInState });
        await userEvent.click(screen.getByText(/privacy policy/i));
        expect(pushSpy).toHaveBeenCalledWith(...packHistoryArgs('/en/privacy-policy'));
      });
    });
  });
});
