import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { getLocalePath } from '@sb/webapp-core/utils';
import { tenantFactory } from '@sb/webapp-tenants/tests/factories/tenant';
import { screen } from '@testing-library/react';
import { GraphQLError } from 'graphql/error/GraphQLError';
import { Route, Routes } from 'react-router';

import { RoutesConfig } from '../../../../config/routes';
import { fillCrudDemoItemDetailsQuery } from '../../../../tests/factories';
import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { CrudDemoItemDetails, crudDemoItemDetailsQuery } from '../crudDemoItemDetails.component';

const tenantId = 'tenantId';

describe('CrudDemoItemDetails: Component', () => {
  const defaultItemId = 'test-id';

  const Component = () => (
    <Routes>
      <Route path={getLocalePath(RoutesConfig.crudDemoItem.details)} element={<CrudDemoItemDetails />} />
      <Route path={getLocalePath(RoutesConfig.crudDemoItem.list)} element={<span>List page</span>} />
    </Routes>
  );

  const defaultCommonQueryMock = fillCommonQueryWithUser(
    currentUserFactory({
      tenants: [
        tenantFactory({
          id: tenantId,
        }),
      ],
    })
  );

  it('should render item details', async () => {
    const routerProps = createMockRouterProps(RoutesConfig.crudDemoItem.details, { id: defaultItemId });
    const variables = { id: defaultItemId, tenantId };
    const data = { id: defaultItemId, name: 'demo item name' };
    const mockRequest = fillCrudDemoItemDetailsQuery(data, variables);

    const apolloMocks = [defaultCommonQueryMock, mockRequest];

    render(<Component />, { routerProps, apolloMocks });

    const elements = await screen.findAllByText(/demo item name/i);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('should render back link and card details on success', async () => {
    const routerProps = createMockRouterProps(RoutesConfig.crudDemoItem.details, { id: defaultItemId });
    const variables = { id: defaultItemId, tenantId };
    const data = { id: defaultItemId, name: 'Test item' };
    const mockRequest = fillCrudDemoItemDetailsQuery(data, variables);

    render(<Component />, { routerProps, apolloMocks: [defaultCommonQueryMock, mockRequest] });

    expect(await screen.findByText(/back to items/i)).toBeInTheDocument();
    expect(screen.getByText(/item information/i)).toBeInTheDocument();
    expect(screen.getByText(/details about this crud example item/i)).toBeInTheDocument();
    expect(screen.getByText(/name:/i)).toBeInTheDocument();
    expect(screen.getByText(/view item details/i)).toBeInTheDocument();
  });

  it('should show error toast and redirect to list on error', async () => {
    const routerProps = createMockRouterProps(RoutesConfig.crudDemoItem.details, { id: defaultItemId });

    const errorMock = composeMockedQueryResult(crudDemoItemDetailsQuery, {
      variables: { id: defaultItemId, tenantId },
      data: {},
      errors: [new GraphQLError('Something went wrong')],
    });

    render(<Component />, { routerProps, apolloMocks: [defaultCommonQueryMock, errorMock] });

    const toast = await screen.findByTestId('toast-1');
    expect(toast).toHaveTextContent('Failed to load item details');
    expect(await screen.findByText('List page')).toBeInTheDocument();
  });

  it('should render null when item data is not available', async () => {
    const routerProps = createMockRouterProps(RoutesConfig.crudDemoItem.details, { id: defaultItemId });

    const nullDataMock = composeMockedQueryResult(crudDemoItemDetailsQuery, {
      variables: { id: defaultItemId, tenantId },
      data: { crudDemoItem: null },
    });

    const { waitForApolloMocks } = render(<Component />, {
      routerProps,
      apolloMocks: [defaultCommonQueryMock, nullDataMock],
    });
    await waitForApolloMocks(1);

    expect(screen.queryByText(/item information/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/back to items/i)).not.toBeInTheDocument();
  });
});
