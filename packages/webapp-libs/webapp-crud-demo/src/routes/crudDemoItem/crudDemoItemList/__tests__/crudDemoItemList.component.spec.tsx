import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { getLocalePath } from '@sb/webapp-core/utils';
import { tenantFactory } from '@sb/webapp-tenants/tests/factories/tenant';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { RoutesConfig } from '../../../../config/routes';
import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { CrudDemoItemList } from '../crudDemoItemList.component';
import { crudDemoItemFactory, fillCrudDemoItemPaginationListQuery } from '@sb/webapp-crud-demo/tests/factories';

describe('CrudDemoItemList: Component', () => {
  const Component = () => (
    <Routes>
      <Route path={getLocalePath(RoutesConfig.crudDemoItem.list)} element={<CrudDemoItemList />} />
      <Route path={getLocalePath(RoutesConfig.crudDemoItem.add)} element={<span>CrudDemoItem add page mock</span>} />
    </Routes>
  );

  const allItems = [...Array(2)].map((_, i) =>
    crudDemoItemFactory({
      id: `item-${i + 1}`,
      name: `${i + 1} item`,
    })
  );

  const tenantId = 'tenantId';

  it('should render all items', async () => {
    const routerProps = createMockRouterProps(RoutesConfig.crudDemoItem.list);

    const apolloMocks = [
      fillCommonQueryWithUser(
        currentUserFactory({
          tenants: [
            tenantFactory({
              id: tenantId,
            }),
          ],
        })
      ),
      fillCrudDemoItemPaginationListQuery(allItems, {}, { tenantId, first: 8 }),
      fillCrudDemoItemPaginationListQuery(allItems, {}, { tenantId, first: 8 }),
    ];
    render(<Component />, { routerProps, apolloMocks });

    expect(await screen.findByText('1 item')).toBeInTheDocument();
    expect(await screen.findByText('2 item')).toBeInTheDocument();
  });

  it('should render link to add new item form', async () => {
    const routerProps = createMockRouterProps(RoutesConfig.crudDemoItem.list);
    const apolloMocks = [
      fillCommonQueryWithUser(
        currentUserFactory({
          tenants: [
            tenantFactory({
              id: tenantId,
            }),
          ],
        })
      ),
      fillCrudDemoItemPaginationListQuery(allItems, {}, { tenantId, first: 8 }),
      fillCrudDemoItemPaginationListQuery(allItems, {}, { tenantId, first: 8 }),
    ];

    render(<Component />, { routerProps, apolloMocks });

    await userEvent.click(await screen.findByText(/add/i));

    expect(screen.getByText('CrudDemoItem add page mock')).toBeInTheDocument();
  });
});
