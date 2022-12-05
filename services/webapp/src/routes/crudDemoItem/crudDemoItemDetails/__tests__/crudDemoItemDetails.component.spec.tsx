import { Route, Routes } from 'react-router';
import { screen } from '@testing-library/react';
import { createMockEnvironment } from 'relay-test-utils';

import { RoutesConfig } from '../../../../app/config/routes';
import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { CrudDemoItemDetails } from '../crudDemoItemDetails.component';
import { fillCommonQueryWithUser } from '../../../../shared/utils/commonQuery';
import { fillCrudDemoItemDetailsQuery } from '../../../../mocks/factories/crudDemoItem';

describe('CrudDemoItemDetails: Component', () => {
  const routePath = ['crudDemoItem', 'details'];
  const defaultItemId = 'test-id';

  const Component = () => (
    <Routes>
      <Route path={RoutesConfig.getLocalePath(routePath)} element={<CrudDemoItemDetails />} />
    </Routes>
  );

  it('should render item details', () => {
    const routerProps = createMockRouterProps(routePath, { id: defaultItemId });
    const relayEnvironment = createMockEnvironment();
    fillCommonQueryWithUser(relayEnvironment);
    fillCrudDemoItemDetailsQuery(relayEnvironment, { name: 'demo item name' }, { id: defaultItemId });

    render(<Component />, { routerProps, relayEnvironment });

    expect(screen.getByText(/demo item name/i)).toBeInTheDocument();
  });
});
