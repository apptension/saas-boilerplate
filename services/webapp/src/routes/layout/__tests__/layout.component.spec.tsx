import React from 'react';
import { screen } from '@testing-library/dom';

import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/react';
import { Layout } from '../layout.component';
import { makeContextRenderer, spiedHistory } from '../../../shared/utils/testUtils';
import { LayoutContext } from '../layout.context';
import { Breakpoint } from '../../../theme/media';
import { prepareState } from '../../../mocks/store';
import { loggedInAuthFactory } from '../../../mocks/factories';

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

describe('Sidebar: Component', () => {
  const component = () => (
    <LayoutContext.Provider value={{ isSideMenuOpen: true, setSideMenuOpen: () => null }}>
      <Layout>
        <span data-testid="content" />
      </Layout>
    </LayoutContext.Provider>
  );
  const render = makeContextRenderer(component);

  describe('on mobile', () => {
    beforeEach(() => {
      mockGetActiveBreakpoint.mockReturnValue(Breakpoint.MOBILE);
    });

    it('should show content', () => {
      render();
      expect(screen.getByTestId('content')).toBeVisible();
    });

    describe('user is logged out', () => {
      it('should not show open menu button', () => {
        render();
        expect(screen.queryByLabelText(/open menu/gi)).not.toBeInTheDocument();
      });

      it('should not show menu links', () => {
        render();
        expect(screen.queryByText(/privacy policy/gi)).not.toBeInTheDocument();
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

    describe('user is logged out', () => {
      it('should not show open menu button', () => {
        render();
        expect(screen.queryByLabelText(/open menu/gi)).not.toBeInTheDocument();
      });

      it('should not show menu links', () => {
        render();
        expect(screen.queryByText(/privacy policy/gi)).not.toBeInTheDocument();
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
