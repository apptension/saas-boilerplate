import { fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { getLocalePath } from '@sb/webapp-core/utils';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';

import { RoutesConfig } from '../../../../config/routes';
import { fillCrudDemoItemDetailsQuery } from '../../../../tests/factories';
import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { CrudDemoItemDetails } from '../crudDemoItemDetails.component';

describe('CrudDemoItemDetails: Component', () => {
  const defaultItemId = 'test-id';

  const Component = () => (
    <Routes>
      <Route path={getLocalePath(RoutesConfig.crudDemoItem.details)} element={<CrudDemoItemDetails />} />
    </Routes>
  );

  it('should render item details', async () => {
    const routerProps = createMockRouterProps(RoutesConfig.crudDemoItem.details, { id: defaultItemId });
    const variables = { id: defaultItemId };
    const data = { id: defaultItemId, name: 'demo item name' };
    const mockRequest = fillCrudDemoItemDetailsQuery(data, variables);

    const apolloMocks = [fillCommonQueryWithUser(), mockRequest];

    render(<Component />, { routerProps, apolloMocks });

    expect(await screen.findByText(/demo item name/i)).toBeInTheDocument();
  });
});
