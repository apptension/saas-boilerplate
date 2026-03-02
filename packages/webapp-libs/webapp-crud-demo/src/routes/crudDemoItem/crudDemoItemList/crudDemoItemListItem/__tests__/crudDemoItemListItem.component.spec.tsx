import { useQuery } from '@apollo/client/react';
import { gql } from '@sb/webapp-api-client';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { getTenantPathHelper } from '@sb/webapp-core/utils';
import { tenantFactory } from '@sb/webapp-tenants/tests/factories/tenant';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Route, Routes, useParams } from 'react-router';

import { RoutesConfig } from '../../../../../config/routes';
import { render } from '../../../../../tests/utils/rendering';
import { CrudDemoItemListItem } from '../crudDemoItemListItem.component';
import { crudDemoItemListItemDeleteMutation } from '../crudDemoItemListItem.graphql';

const crudDemoItemListItemTestQuery = gql(/* GraphQL */ `
  query crudDemoItemListItemTestQuery {
    item: crudDemoItem(id: "test-id") {
      ...crudDemoItemListItem
    }
  }
`);

jest.mock('@sb/webapp-core/services/analytics');

jest.mock('@sb/webapp-tenants/hooks', () => ({
  ...jest.requireActual('@sb/webapp-tenants/hooks'),
  PermissionGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  usePermissionCheck: jest.fn(() => ({ hasPermission: true, loading: false })),
}));

jest.mock('@sb/webapp-core/hooks', () => ({
  ...jest.requireActual('@sb/webapp-core/hooks'),
  useMediaQuery: jest.fn(() => ({ matches: false })),
}));

 
const { usePermissionCheck: mockUsePermissionCheck } = require('@sb/webapp-tenants/hooks') as {
  usePermissionCheck: jest.Mock;
};
 
const { useMediaQuery: mockUseMediaQuery } = require('@sb/webapp-core/hooks') as { useMediaQuery: jest.Mock };

const tenantId = 'tenantId';

describe('CrudDemoItemListItem: Component', () => {
  const EditRouteMock = () => {
    const params = useParams<{ id: string }>();
    return <span>Crud demo item edit mock {params?.id}</span>;
  };

  const DetailsRouteMock = () => {
    const params = useParams<{ id: string }>();
    return <span>Crud demo item details mock {params?.id}</span>;
  };

  const Component = () => {
    const { loading, data } = useQuery(crudDemoItemListItemTestQuery);

    if (loading || !data?.item) {
      return <span />;
    }

    return (
      <Routes>
        <Route path="/" element={<CrudDemoItemListItem item={data.item} />} />
        <Route path={getTenantPathHelper(RoutesConfig.crudDemoItem.details)} element={<DetailsRouteMock />} />
        <Route path={getTenantPathHelper(RoutesConfig.crudDemoItem.edit)} element={<EditRouteMock />} />
      </Routes>
    );
  };

  beforeEach(() => {
    mockUsePermissionCheck.mockReturnValue({ hasPermission: true, loading: false });
    mockUseMediaQuery.mockReturnValue({ matches: false });
  });

  it('should render link to details page', async () => {
    const item = { id: 'test-id', name: 'demo item name', tenantId };

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
      composeMockedQueryResult(crudDemoItemListItemTestQuery, {
        data: {
          item: {
            __typename: 'CrudDemoItemType',
            ...item,
          },
        },
      }),
    ];

    render(<Component />, { apolloMocks });
    expect(await screen.findByText(item.name)).toBeInTheDocument();
    await userEvent.click(screen.getByText(/demo item name/i));
    expect(screen.getByText('Crud demo item details mock test-id')).toBeInTheDocument();
  });

  it('should render link to edit form', async () => {
    const item = { id: 'test-id', name: 'demo item name', tenantId };

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
      composeMockedQueryResult(crudDemoItemListItemTestQuery, {
        data: {
          item: {
            ...item,
            __typename: 'CrudDemoItemType',
          },
        },
      }),
    ];

    render(<Component />, { apolloMocks });
    expect(await screen.findByText(item.name)).toBeInTheDocument();
    await userEvent.click(screen.getByTestId(/toggle-button/i));

    await userEvent.click(screen.getByText(/edit/i));
    expect(screen.getByText('Crud demo item edit mock test-id')).toBeInTheDocument();
  });
  it('should delete item', async () => {
    const item = { id: 'test-id', name: 'demo item name', tenantId };

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
      composeMockedQueryResult(crudDemoItemListItemTestQuery, {
        data: {
          item: {
            ...item,
            __typename: 'CrudDemoItemType',
          },
        },
      }),
      composeMockedQueryResult(crudDemoItemListItemDeleteMutation, {
        data: {
          deleteCrudDemoItem: {
            deletedIds: [item.id],
            __typename: 'DeleteCrudDemoItemMutationPayload',
          },
        },
        variables: {
          input: { id: item.id, tenantId },
        },
      }),
    ];

    render(<Component />, { apolloMocks });
    expect(await screen.findByText(item.name)).toBeInTheDocument();
    await userEvent.click(screen.getByTestId(/toggle-button/i));
    await userEvent.click(screen.getByText(/delete/i));

    await waitFor(() => expect(trackEvent).toBeCalledWith('crud', 'delete', item.id));
  });

  it('should show success message', async () => {
    const item = { id: 'test-id', name: 'demo item name', tenantId };

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
      composeMockedQueryResult(crudDemoItemListItemTestQuery, {
        data: {
          item: {
            ...item,
            __typename: 'CrudDemoItemType',
          },
        },
      }),
      composeMockedQueryResult(crudDemoItemListItemDeleteMutation, {
        data: {
          deleteCrudDemoItem: {
            deletedIds: [item.id],
            __typename: 'DeleteCrudDemoItemMutationPayload',
          },
        },
        variables: {
          input: { id: item.id, tenantId },
        },
      }),
    ];

    render(<Component />, { apolloMocks });
    expect(await screen.findByText(item.name)).toBeInTheDocument();
    await userEvent.click(screen.getByTestId(/toggle-button/i));
    await userEvent.click(screen.getByText(/delete/i));

    await waitFor(() => expect(trackEvent).toBeCalledWith('crud', 'delete', item.id));

    const toast = await screen.findByTestId('toast-1');

    expect(trackEvent).toHaveBeenCalledWith('crud', 'delete', item.id);
    expect(toast).toHaveTextContent('Item deleted successfully!');
  });

  it('should not render action buttons in mobile view when user lacks permission', async () => {
    mockUsePermissionCheck.mockReturnValue({ hasPermission: false, loading: false });
    mockUseMediaQuery.mockReturnValue({ matches: false });

    const item = { id: 'test-id', name: 'demo item name', tenantId };

    const apolloMocks = [
      fillCommonQueryWithUser(
        currentUserFactory({
          tenants: [tenantFactory({ id: tenantId })],
        })
      ),
      composeMockedQueryResult(crudDemoItemListItemTestQuery, {
        data: {
          item: {
            __typename: 'CrudDemoItemType',
            ...item,
          },
        },
      }),
    ];

    render(<Component />, { apolloMocks });
    expect(await screen.findByText(item.name)).toBeInTheDocument();

    expect(screen.queryByTestId(/toggle-button/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/edit/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/delete/i)).not.toBeInTheDocument();
  });

  it('should not render action buttons in desktop view when user lacks permission', async () => {
    mockUsePermissionCheck.mockReturnValue({ hasPermission: false, loading: false });
    mockUseMediaQuery.mockReturnValue({ matches: true });

    const item = { id: 'test-id', name: 'demo item name', tenantId };

    const apolloMocks = [
      fillCommonQueryWithUser(
        currentUserFactory({
          tenants: [tenantFactory({ id: tenantId })],
        })
      ),
      composeMockedQueryResult(crudDemoItemListItemTestQuery, {
        data: {
          item: {
            __typename: 'CrudDemoItemType',
            ...item,
          },
        },
      }),
    ];

    render(<Component />, { apolloMocks });
    expect(await screen.findByText(item.name)).toBeInTheDocument();

    expect(screen.queryByText(/edit/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/delete/i)).not.toBeInTheDocument();
  });

  it('should render inline buttons in desktop view with permission', async () => {
    mockUseMediaQuery.mockReturnValue({ matches: true });

    const item = { id: 'test-id', name: 'demo item name', tenantId };

    const apolloMocks = [
      fillCommonQueryWithUser(
        currentUserFactory({
          tenants: [tenantFactory({ id: tenantId })],
        })
      ),
      composeMockedQueryResult(crudDemoItemListItemTestQuery, {
        data: {
          item: {
            __typename: 'CrudDemoItemType',
            ...item,
          },
        },
      }),
    ];

    render(<Component />, { apolloMocks });
    expect(await screen.findByText(item.name)).toBeInTheDocument();

    expect(screen.getByText(/edit/i)).toBeInTheDocument();
    expect(screen.getByText(/delete/i)).toBeInTheDocument();
  });
});
