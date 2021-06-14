import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { OperationDescriptor } from 'react-relay/hooks';

import Query from '../../../../__generated__/crudDemoItemListQuery.graphql';
import { connectionFromArray, makeContextRenderer, spiedHistory } from '../../../../shared/utils/testUtils';
import { CrudDemoItemList } from '../crudDemoItemList.component';

describe('CrudDemoItemList: Component', () => {
  const component = () => <CrudDemoItemList />;
  const render = makeContextRenderer(component);

  it('should render all items', () => {
    const relayEnvironment = createMockEnvironment();
    relayEnvironment.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        CrudDemoItemConnection: () => connectionFromArray([{ name: 'first item' }, { name: 'second item' }]),
      })
    );
    relayEnvironment.mock.queuePendingOperation(Query, { id: 'test-id' });

    render({}, { relayEnvironment });

    expect(screen.getByText('first item')).toBeInTheDocument();
    expect(screen.getByText('second item')).toBeInTheDocument();
  });

  it('should render link to add new item form', () => {
    const relayEnvironment = createMockEnvironment();
    relayEnvironment.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        CrudDemoItemConnection: () => connectionFromArray([{ name: 'first item' }, { name: 'second item' }]),
      })
    );
    relayEnvironment.mock.queuePendingOperation(Query, { id: 'test-id' });

    const { pushSpy, history } = spiedHistory();
    render({}, { router: { history }, relayEnvironment });
    userEvent.click(screen.getByText(/add/gi));
    expect(pushSpy).toHaveBeenCalledWith('/en/crud-demo-item/add');
  });
});
