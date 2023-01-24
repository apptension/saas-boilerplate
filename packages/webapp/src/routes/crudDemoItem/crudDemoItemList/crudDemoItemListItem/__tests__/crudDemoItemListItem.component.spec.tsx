import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { useQuery } from '@apollo/client';
import { MockPayloadGenerator } from 'relay-test-utils';
import { OperationDescriptor } from 'react-relay/hooks';
import { Route, Routes, useParams } from 'react-router';

import { CrudDemoItemListItem } from '../crudDemoItemListItem.component';
import { render } from '../../../../../tests/utils/rendering';
import { RoutesConfig } from '../../../../../app/config/routes';
import { getRelayEnv } from '../../../../../tests/utils/relay';
import { gql } from '../../../../../shared/services/graphqlApi/__generated/gql';
import { composeMockedQueryResult } from '../../../../../tests/utils/fixtures';

const CRUD_DEMO_ITEM_LIST_ITEM_TEST_QUERY = gql(/* GraphQL */ `
  query crudDemoItemListItemTestQuery {
    item: crudDemoItem(id: "test-id") {
      ...crudDemoItemListItem
    }
  }
`);

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
    const { loading, data } = useQuery(CRUD_DEMO_ITEM_LIST_ITEM_TEST_QUERY);

    if (loading || !data?.item) {
      return <span />;
    }

    return (
      <Routes>
        <Route path="/" element={<CrudDemoItemListItem item={data.item} />} />
        <Route path={RoutesConfig.getLocalePath(['crudDemoItem', 'details'])} element={<DetailsRouteMock />} />
        <Route path={RoutesConfig.getLocalePath(['crudDemoItem', 'edit'])} element={<EditRouteMock />} />
      </Routes>
    );
  };

  it('should render link to details page', async () => {
    const relayEnvironment = getRelayEnv();
    const item = { id: 'test-id', name: 'demo item name' };
    relayEnvironment.mock.queueOperationResolver((operation: OperationDescriptor) => {
      return MockPayloadGenerator.generate(operation, {
        CrudDemoItemType: () => item,
      });
    });

    const apolloMocks = [
      composeMockedQueryResult(CRUD_DEMO_ITEM_LIST_ITEM_TEST_QUERY, {
        data: {
          item: {
            __typename: 'CrudDemoItemType',
            ...item,
          },
        },
      }),
    ];

    render(<Component />, { relayEnvironment, apolloMocks });
    expect(await screen.findByText(item.name)).toBeInTheDocument();
    await userEvent.click(screen.getByText(/demo item name/i));
    expect(screen.getByText('Crud demo item details mock test-id')).toBeInTheDocument();
  });

  it('should render link to edit form', async () => {
    const relayEnvironment = getRelayEnv();
    const item = { id: 'test-id', name: 'demo item name' };
    relayEnvironment.mock.queueOperationResolver((operation: OperationDescriptor) => {
      return MockPayloadGenerator.generate(operation, {
        CrudDemoItemType: () => item,
      });
    });

    const apolloMocks = [
      composeMockedQueryResult(CRUD_DEMO_ITEM_LIST_ITEM_TEST_QUERY, {
        data: {
          item: {
            ...item,
            __typename: 'CrudDemoItemType',
          },
        },
      }),
    ];

    render(<Component />, { relayEnvironment, apolloMocks });
    expect(await screen.findByText(item.name)).toBeInTheDocument();
    await userEvent.click(screen.getByText(/edit/i));
    expect(screen.getByText('Crud demo item edit mock test-id')).toBeInTheDocument();
  });
});
