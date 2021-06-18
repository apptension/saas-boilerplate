import React from 'react';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';

import CrudDemoItemListQuery, { crudDemoItemListQuery } from '../../../../__generated__/crudDemoItemListQuery.graphql';
import { CrudDemoItemListItem } from '../crudDemoItemListItem';
import { List } from '../crudDemoItemList.styles';
import { mapConnection } from '../../../../shared/utils/graphql';

export interface CrudDemoItemListContentProps {
  queryRef: PreloadedQuery<crudDemoItemListQuery>;
}

export const CrudDemoItemListContent = ({ queryRef }: CrudDemoItemListContentProps) => {
  const { allCrudDemoItems } = usePreloadedQuery(CrudDemoItemListQuery, queryRef);

  return (
    <List>
      {mapConnection(
        (crudDemoItem) => (
          <CrudDemoItemListItem item={crudDemoItem} key={crudDemoItem.id} />
        ),
        allCrudDemoItems
      )}
    </List>
  );
};
