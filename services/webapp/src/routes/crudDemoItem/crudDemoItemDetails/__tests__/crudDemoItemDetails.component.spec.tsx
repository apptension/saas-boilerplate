import { Route, Routes } from 'react-router';
import { screen } from '@testing-library/react';
import { OperationDescriptor } from 'react-relay/hooks';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

import CrudDemoItemDetailsQuery from '../../../../__generated__/crudDemoItemDetailsQuery.graphql';
import { RoutesConfig } from '../../../../app/config/routes';
import { createMockRouterHistory, render } from '../../../../tests/utils/rendering';
import { CrudDemoItemDetails } from '../crudDemoItemDetails.component';
import { fillCommonQueryWithUser } from '../../../../shared/utils/commonQuery';

describe('CrudDemoItemDetails: Component', () => {
  const routePath = ['crudDemoItem', 'details'];

  const Component = () => (
    <Routes>
      <Route path={RoutesConfig.getLocalePath(routePath)} element={<CrudDemoItemDetails />} />
    </Routes>
  );

  it('should render item details', () => {
    const routerHistory = createMockRouterHistory(routePath, { id: 'test-id' });
    const relayEnvironment = createMockEnvironment();
    fillCommonQueryWithUser(relayEnvironment);
    relayEnvironment.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        CrudDemoItemType: () => ({ name: 'demo item name' }),
      })
    );
    relayEnvironment.mock.queuePendingOperation(CrudDemoItemDetailsQuery, { id: 'test-id' });

    render(<Component />, { routerHistory, relayEnvironment });

    expect(screen.getByText(/demo item name/i)).toBeInTheDocument();
  });
});
