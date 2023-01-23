import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { RoutesConfig } from '../../../../app/config/routes';
import { CrudDemoItemList } from '../crudDemoItemList.component';
import { getRelayEnv } from '../../../../tests/utils/relay';
import { fillCrudDemoItemListQuery } from '../../../../mocks/factories/crudDemoItem';

describe('CrudDemoItemList: Component', () => {
  const routePath = ['crudDemoItem', 'list'];
  const addRoutePath = ['crudDemoItem', 'add'];

  const Component = () => (
    <Routes>
      <Route path={RoutesConfig.getLocalePath(routePath)} element={<CrudDemoItemList />} />
      <Route path={RoutesConfig.getLocalePath(addRoutePath)} element={<span>CrudDemoItem add page mock</span>} />
    </Routes>
  );

  it('should render all items', () => {
    const routerProps = createMockRouterProps(routePath);
    const relayEnvironment = getRelayEnv();
    fillCrudDemoItemListQuery(relayEnvironment);

    render(<Component />, { relayEnvironment, routerProps });

    expect(screen.getByText('First item')).toBeInTheDocument();
    expect(screen.getByText('Second item')).toBeInTheDocument();
  });

  it('should render link to add new item form', async () => {
    const routerProps = createMockRouterProps(routePath);
    const relayEnvironment = getRelayEnv();
    fillCrudDemoItemListQuery(relayEnvironment);

    render(<Component />, { relayEnvironment, routerProps });
    await userEvent.click(screen.getByText(/add/i));

    expect(screen.getByText('CrudDemoItem add page mock')).toBeInTheDocument();
  });
});
