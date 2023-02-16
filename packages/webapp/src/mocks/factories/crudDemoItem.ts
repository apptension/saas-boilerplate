import { crudDemoItemDetailsQuery } from '../../routes/crudDemoItem/crudDemoItemDetails/crudDemoItemDetails.component';
import { crudDemoItemListQuery } from '../../routes/crudDemoItem/crudDemoItemList/crudDemoItemList.component';
import { editCrudDemoItemQuery } from '../../routes/crudDemoItem/editCrudDemoItem/editCrudDemoItem.graphql';
import { composeMockedListQueryResult, composeMockedQueryResult } from '../../tests/utils/fixtures';

export const fillCrudDemoItemDetailsQuery = (
  data = {
    name: 'Demo item name',
  },
  variables = {}
) => {
  return composeMockedQueryResult(crudDemoItemDetailsQuery, {
    variables,
    data: {
      crudDemoItem: data,
    },
  });
};

export const fillEditCrudDemoItemQuery = (
  data: object = {
    name: 'Default name',
  },
  variables = {}
) => {
  return composeMockedQueryResult(editCrudDemoItemQuery, {
    data: {
      crudDemoItem: data,
    },
    variables,
  });
};

export const fillCrudDemoItemListQuery = (
  data = [
    { id: 1, name: 'First item' },
    { id: 2, name: 'Second item' },
  ]
) => {
  return composeMockedListQueryResult(crudDemoItemListQuery, 'allCrudDemoItems', 'CrudDemoItemType', {
    data,
  });
};
