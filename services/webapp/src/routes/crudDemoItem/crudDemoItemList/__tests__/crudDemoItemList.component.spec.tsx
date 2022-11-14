import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { MockPayloadGenerator } from 'relay-test-utils';
import { OperationDescriptor } from 'react-relay/hooks';
import { Route, Routes } from 'react-router-dom';

import crudDemoItemListQueryGraphql from '../__generated__/crudDemoItemListQuery.graphql';
import { connectionFromArray } from '../../../../shared/utils/testUtils';
import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { RoutesConfig } from '../../../../app/config/routes';
import { CrudDemoItemList } from '../crudDemoItemList.component';
import { getRelayEnv } from '../../../../tests/utils/relay';

describe('CrudDemoItemList: Component', () => {
  const routePath = ['crudDemoItem', 'list'];
  const addRoutePath = ['crudDemoItem', 'add'];

  const Component = () => (
    <Routes>
      <Route path={RoutesConfig.getLocalePath(routePath)} element={<CrudDemoItemList />} />
      <Route path={RoutesConfig.getLocalePath(addRoutePath)} element={<span>CrudDemoItem add page mock</span>} />
    </Routes>
  );

  it('should render all items', () => {
    const routerProps = createMockRouterProps(routePath);
    const relayEnvironment = getRelayEnv();
    relayEnvironment.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        CrudDemoItemConnection: () => connectionFromArray([{ name: 'first item' }, { name: 'second item' }]),
      })
    );
    relayEnvironment.mock.queuePendingOperation(crudDemoItemListQueryGraphql, { id: 'test-id' });

    render(<Component />, { relayEnvironment, routerProps });

    expect(screen.getByText('first item')).toBeInTheDocument();
    expect(screen.getByText('second item')).toBeInTheDocument();
  });

  it('should render link to add new item form', async () => {
    const routerProps = createMockRouterProps(routePath);
    const relayEnvironment = getRelayEnv();
    relayEnvironment.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        CrudDemoItemConnection: () => connectionFromArray([{ name: 'first item' }, { name: 'second item' }]),
      })
    );
    relayEnvironment.mock.queuePendingOperation(crudDemoItemListQueryGraphql, { id: 'test-id' });

    render(<Component />, { relayEnvironment, routerProps });
    await userEvent.click(screen.getByText(/add/i));

    expect(screen.getByText('CrudDemoItem add page mock')).toBeInTheDocument();
  });
});
