import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { currentUserFactory } from '../../../../../mocks/factories';
import { render } from '../../../../../tests/utils/rendering';
import { RoutesConfig } from '../../../../../app/config/routes';
import { getRelayEnv as getBaseRelayEnv } from '../../../../../tests/utils/relay';
import { Header } from '../header.component';

const getRelayEnv = () => getBaseRelayEnv(currentUserFactory());

describe('Header: Component', () => {
  const Component = () => (
    <Routes>
      <Route path="/" element={<Header />} />
      <Route path={RoutesConfig.getLocalePath(['home'])} element={<span>Home mock route</span>} />
      <Route path={RoutesConfig.getLocalePath(['profile'])} element={<span>Profile mock route</span>} />
      <Route path={RoutesConfig.getLocalePath(['logout'])} element={<span>Logout mock route</span>} />
    </Routes>
  );

  describe('user is logged in', () => {
    it('should open homepage when clicked on "home" link', async () => {
      const relayEnvironment = getRelayEnv();
      render(<Component />, { relayEnvironment });

      await userEvent.click(screen.getByLabelText(/home/i));
      expect(screen.getByText('Home mock route')).toBeInTheDocument();
    });

    it('should not display "profile" link', () => {
      render(<Component />);
      expect(screen.queryByText(/profile/i)).not.toBeInTheDocument();
    });

    it('should not display "logout" link', () => {
      render(<Component />);
      expect(screen.queryByText(/log out/i)).not.toBeInTheDocument();
    });

    it('should open profile when clicked on "profile" link', async () => {
      const relayEnvironment = getRelayEnv();
      render(<Component />, { relayEnvironment });

      await userEvent.click(screen.getByLabelText(/open profile menu/i));
      await userEvent.click(screen.getByText(/profile/i));
      expect(screen.getByText('Profile mock route')).toBeInTheDocument();
    });

    it('should dispatch logout action when clicking on "logout" button', async () => {
      const relayEnvironment = getRelayEnv();
      render(<Component />, { relayEnvironment });
      await userEvent.click(screen.getByLabelText(/open profile menu/i));
      await userEvent.click(screen.getByText(/log out/i));
      expect(screen.getByText('Logout mock route')).toBeInTheDocument();
    });
  });

  describe('user is logged out', () => {
    it('should not display "home" link', async () => {
      render(<Component />);
      expect(screen.queryByText(/home/i)).not.toBeInTheDocument();
    });

    it('should not display avatar', () => {
      render(<Component />);
      expect(screen.queryByLabelText(/open profile menu/i)).not.toBeInTheDocument();
    });
  });
});
