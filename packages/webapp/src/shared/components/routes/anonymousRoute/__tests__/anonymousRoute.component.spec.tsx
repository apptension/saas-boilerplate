import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { Role } from '../../../../../modules/auth/auth.types';
import { render } from '../../../../../tests/utils/rendering';
import { AnonymousRoute } from '../anonymousRoute.component';

describe('AnonymousRoute: Component', () => {
  const Component = () => (
    <Routes>
      <Route path="/" element={<AnonymousRoute />}>
        <Route index element={<span data-testid="content" />} />
      </Route>
      <Route path="/en/" element={<span />} />
      <Route path="/en/home" element={<span data-testid="home-content" />} />
      <Route path="/en/profile" element={<span data-testid="profile-content" />} />
    </Routes>
  );

  describe('user is logged out', () => {
    it('should render content', async () => {
      render(<Component />);
      expect(await screen.findByTestId('content')).toBeInTheDocument();
    });
  });

  describe('user is logged in', () => {
    it('should redirect to homepage', async () => {
      const apolloMocks = [
        fillCommonQueryWithUser(
          currentUserFactory({
            roles: [Role.ADMIN],
          })
        ),
      ];

      const { waitForApolloMocks } = render(<Component />, { apolloMocks });
      await waitForApolloMocks(0);
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
      expect(screen.queryByTestId('home-content')).not.toBeInTheDocument();
    });

    it('should redirect to redirectUrl', async () => {
      const mockSearch = 'en/profile';
      const spy = jest.spyOn(URLSearchParams.prototype, 'get').mockImplementation((key) => mockSearch);

      const apolloMocks = [
        fillCommonQueryWithUser(
          currentUserFactory({
            roles: [Role.ADMIN],
          })
        ),
      ];

      const { waitForApolloMocks } = render(<Component />, { apolloMocks });
      await waitForApolloMocks(0);
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
      expect(screen.getByTestId('profile-content')).toBeInTheDocument();
      spy.mockClear();
    });
  });
});
