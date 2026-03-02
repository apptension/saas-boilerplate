import { getLocalePath } from '@sb/webapp-core/utils';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { RoutesConfig } from '../../../../../../app/config/routes';
import { render } from '../../../../../../tests/utils/rendering';
import { SidebarLogo } from '../sidebarLogo.component';

describe('SidebarLogo: Component', () => {
  const homePath = getLocalePath(RoutesConfig.home);

  it('should render full logo when not collapsed', async () => {
    render(
      <Routes>
        <Route path="/" element={<SidebarLogo isCollapsed={false} logoColor="#000" to={homePath} />} />
        <Route path={homePath} element={<span>Home</span>} />
      </Routes>
    );

    const link = await screen.findByRole('link', { name: /go back home/i });
    expect(link).toBeInTheDocument();
  });

  it('should render signet when collapsed', async () => {
    render(
      <Routes>
        <Route path="/" element={<SidebarLogo isCollapsed={true} logoColor="#000" to={homePath} />} />
        <Route path={homePath} element={<span>Home</span>} />
      </Routes>
    );

    const link = await screen.findByRole('link', { name: /go back home/i });
    expect(link).toBeInTheDocument();
  });

  it('should call onLogoClick when clicked', async () => {
    const onLogoClick = jest.fn();
    render(
      <Routes>
        <Route
          path="/"
          element={
            <SidebarLogo isCollapsed={false} logoColor="#000" to={homePath} onLogoClick={onLogoClick} />
          }
        />
        <Route path={homePath} element={<span>Home</span>} />
      </Routes>
    );

    await userEvent.click(await screen.findByRole('link', { name: /go back home/i }));
    expect(onLogoClick).toHaveBeenCalledTimes(1);
  });
});
