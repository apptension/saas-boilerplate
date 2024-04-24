import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { getLocalePath } from '@sb/webapp-core/utils';
import { tenantFactory } from '@sb/webapp-tenants/tests/factories/tenant';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';

import { RoutesConfig } from '../../../../config/routes';
import { fillCrudDemoItemDetailsQuery } from '../../../../tests/factories';
import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { CrudDemoItemDetails } from '../crudDemoItemDetails.component';

const tenantId = 'tenantId';

describe('CrudDemoItemDetails: Component', () => {
  const defaultItemId = 'test-id';

  const Component = () => (
    <Routes>
      <Route path={getLocalePath(RoutesConfig.crudDemoItem.details)} element={<CrudDemoItemDetails />} />
    </Routes>
  );

  it('should render item details', async () => {
    const commonQueryMock = fillCommonQueryWithUser(
      currentUserFactory({
        tenants: [
          tenantFactory({
            id: tenantId,
          }),
        ],
      })
    );
    const routerProps = createMockRouterProps(RoutesConfig.crudDemoItem.details, { id: defaultItemId });
    const variables = { id: defaultItemId, tenantId };
    const data = { id: defaultItemId, name: 'demo item name' };
    const mockRequest = fillCrudDemoItemDetailsQuery(data, variables);

    const apolloMocks = [commonQueryMock, mockRequest];

    render(<Component />, { routerProps, apolloMocks });

    expect(await screen.findByText(/demo item name/i)).toBeInTheDocument();
  });
});
