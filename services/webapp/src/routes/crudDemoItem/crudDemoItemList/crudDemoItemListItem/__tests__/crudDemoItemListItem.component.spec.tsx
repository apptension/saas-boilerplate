import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import graphql from 'babel-plugin-relay/macro';
import { useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { OperationDescriptor } from 'react-relay/hooks';
import { crudDemoItemListItemTestQuery } from '../../../../../__generated__/crudDemoItemListItemTestQuery.graphql';
import { makeContextRenderer, spiedHistory } from '../../../../../shared/utils/testUtils';
import { CrudDemoItemListItem } from '../crudDemoItemListItem.component';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('CrudDemoItemListItem: Component', () => {
  const TestRenderer = () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
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

    return <CrudDemoItemListItem item={data.item} />;
  };

  const render = makeContextRenderer(() => <TestRenderer />);

  beforeEach(() => {
    mockDispatch.mockReset();
  });

  it('should render link to details page', () => {
    const relayEnvironment = createMockEnvironment();
    relayEnvironment.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        CrudDemoItemType: () => ({ id: 'test-id', name: 'demo item name' }),
      })
    );

    const { pushSpy, history } = spiedHistory();
    render({}, { router: { history }, relayEnvironment });
    userEvent.click(screen.getByText(/demo item name/gi));
    expect(pushSpy).toHaveBeenCalledWith('/en/crud-demo-item/test-id');
  });

  it('should render link to edit form', () => {
    const relayEnvironment = createMockEnvironment();
    relayEnvironment.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        CrudDemoItemType: () => ({ id: 'test-id', name: 'demo item name' }),
      })
    );

    const { pushSpy, history } = spiedHistory();
    render({}, { router: { history }, relayEnvironment });
    userEvent.click(screen.getByText(/edit/gi));
    expect(pushSpy).toHaveBeenCalledWith('/en/crud-demo-item/test-id/edit');
  });
});
