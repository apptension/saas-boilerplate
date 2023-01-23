import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import graphql from 'babel-plugin-relay/macro';
import { useLazyLoadQuery } from 'react-relay';
import { MockPayloadGenerator } from 'relay-test-utils';
import { OperationDescriptor } from 'react-relay/hooks';
import { Route, Routes, useParams } from 'react-router';

import { CrudDemoItemListItem } from '../crudDemoItemListItem.component';
import { render } from '../../../../../tests/utils/rendering';
import { RoutesConfig } from '../../../../../app/config/routes';
import { getRelayEnv } from '../../../../../tests/utils/relay';
import { crudDemoItemListItemTestQuery } from './__generated__/crudDemoItemListItemTestQuery.graphql';

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
    const data = useLazyLoadQuery<crudDemoItemListItemTestQuery>(
      graphql`
        query crudDemoItemListItemTestQuery @relay_test_operation {
          item: crudDemoItem(id: "test-id") {
            ...crudDemoItemListItem
          }
        }
      `,
      {}
    );

    if (!data.item) {
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
    relayEnvironment.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        CrudDemoItemType: () => ({ id: 'test-id', name: 'demo item name' }),
      })
    );

    render(<Component />, { relayEnvironment });
    await userEvent.click(screen.getByText(/demo item name/i));
    expect(screen.getByText('Crud demo item details mock test-id')).toBeInTheDocument();
  });

  it('should render link to edit form', async () => {
    const relayEnvironment = getRelayEnv();
    relayEnvironment.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        CrudDemoItemType: () => ({ id: 'test-id', name: 'demo item name' }),
      })
    );

    render(<Component />, { relayEnvironment });
    await userEvent.click(screen.getByText(/edit/i));
    expect(screen.getByText('Crud demo item edit mock test-id')).toBeInTheDocument();
  });
});
