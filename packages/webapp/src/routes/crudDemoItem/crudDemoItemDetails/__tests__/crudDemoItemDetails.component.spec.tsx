import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';

import { RoutesConfig } from '../../../../app/config/routes';
import { fillCrudDemoItemDetailsQuery } from '../../../../mocks/factories/crudDemoItem';
import { fillCommonQueryWithUser } from '../../../../shared/utils/commonQuery';
import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { CrudDemoItemDetails } from '../crudDemoItemDetails.component';

describe('CrudDemoItemDetails: Component', () => {
  const routePath = ['crudDemoItem', 'details'];
  const defaultItemId = 'test-id';

  const Component = () => (
    <Routes>
      <Route path={RoutesConfig.getLocalePath(routePath)} element={<CrudDemoItemDetails />} />
    </Routes>
  );

  it('should render item details', async () => {
    const routerProps = createMockRouterProps(routePath, { id: defaultItemId });
    const variables = { id: defaultItemId };
    const data = { id: defaultItemId, name: 'demo item name' };
    const mockRequest = fillCrudDemoItemDetailsQuery(data, variables);

    const apolloMocks = [fillCommonQueryWithUser(), mockRequest];

    render(<Component />, { routerProps, apolloMocks });

    expect(await screen.findByText(/Loading .../i)).toBeInTheDocument();
    expect(await screen.findByText(/demo item name/i)).toBeInTheDocument();
  });
});
