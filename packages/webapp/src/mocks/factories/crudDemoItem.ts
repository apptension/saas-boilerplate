import { OperationDescriptor } from 'react-relay/hooks';
import { MockPayloadGenerator, RelayMockEnvironment } from 'relay-test-utils';

import crudDemoItemDetailsQueryGraphql from '../../routes/crudDemoItem/crudDemoItemDetails/__generated__/crudDemoItemDetailsQuery.graphql';
import { CRUD_DEMO_ITEM_DETAILS_QUERY } from '../../routes/crudDemoItem/crudDemoItemDetails/crudDemoItemDetails.component';
import CrudDemoItemListQuery from '../../routes/crudDemoItem/crudDemoItemList/__generated__/crudDemoItemListQuery.graphql';
import { CRUD_DEMO_ITEM_LIST_QUERY } from '../../routes/crudDemoItem/crudDemoItemList/crudDemoItemList.component';
import EditCrudDemoItemQuery from '../../routes/crudDemoItem/editCrudDemoItem/__generated__/editCrudDemoItemQuery.graphql';
import { CRUD_DEMO_ITEM_EDIT_QUERY } from '../../routes/crudDemoItem/editCrudDemoItem/editCrudDemoItem.graphql';
import {
  composeMockedListQueryResult,
  composeMockedQueryResult,
  connectionFromArray,
} from '../../tests/utils/fixtures';

export const fillCrudDemoItemDetailsQuery = (
  env?: RelayMockEnvironment,
  data = {
    name: 'Demo item name',
  },
  variables = {}
) => {
  if (env) {
    env.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        CrudDemoItemType() {
          return data;
        },
      })
    );
    env.mock.queuePendingOperation(crudDemoItemDetailsQueryGraphql, variables);
  }
  return composeMockedQueryResult(CRUD_DEMO_ITEM_DETAILS_QUERY, {
    variables,
    data: {
      crudDemoItem: data,
    },
  });
};

export const fillEditCrudDemoItemQuery = (
  env?: RelayMockEnvironment,
  data: object = {
    name: 'Default name',
  },
  variables = {}
) => {
  if (env) {
    env.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        CrudDemoItemType() {
          return data;
        },
      })
    );
    env.mock.queuePendingOperation(EditCrudDemoItemQuery, variables);
  }

  return composeMockedQueryResult(CRUD_DEMO_ITEM_EDIT_QUERY, {
    data: {
      crudDemoItem: data,
    },
    variables,
  });
};

export const fillCrudDemoItemListQuery = (
  env?: RelayMockEnvironment,
  data = [
    { id: 1, name: 'First item' },
    { id: 2, name: 'Second item' },
  ]
) => {
  if (env) {
    env.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        CrudDemoItemConnection: (...args) => connectionFromArray(data),
      })
    );
    env.mock.queuePendingOperation(CrudDemoItemListQuery, {});
  }

  return composeMockedListQueryResult(CRUD_DEMO_ITEM_LIST_QUERY, 'allCrudDemoItems', 'CrudDemoItemType', {
    data,
  });
};
