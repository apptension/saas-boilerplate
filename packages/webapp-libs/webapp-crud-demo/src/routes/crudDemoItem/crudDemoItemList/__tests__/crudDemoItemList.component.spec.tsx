import { fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { getLocalePath } from '@sb/webapp-core/utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { RoutesConfig } from '../../../../config/routes';
import { fillCrudDemoItemListQuery } from '../../../../tests/factories';
import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { CrudDemoItemList } from '../crudDemoItemList.component';

describe('CrudDemoItemList: Component', () => {
  const Component = () => (
    <Routes>
      <Route path={getLocalePath(RoutesConfig.crudDemoItem.list)} element={<CrudDemoItemList />} />
      <Route path={getLocalePath(RoutesConfig.crudDemoItem.add)} element={<span>CrudDemoItem add page mock</span>} />
    </Routes>
  );

  it('should render all items', async () => {
    const routerProps = createMockRouterProps(RoutesConfig.crudDemoItem.list);

    const apolloMocks = [fillCommonQueryWithUser(), fillCrudDemoItemListQuery()];
    render(<Component />, { routerProps, apolloMocks });

    expect(await screen.findByText('First item')).toBeInTheDocument();
    expect(await screen.findByText('Second item')).toBeInTheDocument();
  });

  it('should render link to add new item form', async () => {
    const routerProps = createMockRouterProps(RoutesConfig.crudDemoItem.list);
    const apolloMocks = [fillCommonQueryWithUser(), fillCrudDemoItemListQuery()];

    render(<Component />, { routerProps, apolloMocks });

    await userEvent.click(await screen.findByText(/add/i));

    expect(screen.getByText('CrudDemoItem add page mock')).toBeInTheDocument();
  });
});
