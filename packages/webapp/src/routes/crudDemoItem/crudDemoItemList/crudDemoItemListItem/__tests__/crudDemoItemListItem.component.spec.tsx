import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { useQuery } from '@apollo/client';
import { Route, Routes, useParams } from 'react-router';

import { CrudDemoItemListItem } from '../crudDemoItemListItem.component';
import { render } from '../../../../../tests/utils/rendering';
import { RoutesConfig } from '../../../../../app/config/routes';
import { gql } from '../../../../../shared/services/graphqlApi/__generated/gql';
import { composeMockedQueryResult } from '../../../../../tests/utils/fixtures';
import { fillCommonQueryWithUser } from '../../../../../shared/utils/commonQuery';

const crudDemoItemListItemTestQuery = gql(/* GraphQL */ `
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
    const { loading, data } = useQuery(crudDemoItemListItemTestQuery);

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
    const item = { id: 'test-id', name: 'demo item name' };

    const apolloMocks = [
      fillCommonQueryWithUser(),
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
    const item = { id: 'test-id', name: 'demo item name' };

    const apolloMocks = [
      fillCommonQueryWithUser(),
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
    await userEvent.click(screen.getByText(/edit/i));
    expect(screen.getByText('Crud demo item edit mock test-id')).toBeInTheDocument();
  });
});
