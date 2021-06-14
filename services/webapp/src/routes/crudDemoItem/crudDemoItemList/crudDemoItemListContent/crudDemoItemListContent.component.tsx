import React from 'react';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';

import CrudDemoItemListQuery, { crudDemoItemListQuery } from '../../../../__generated__/crudDemoItemListQuery.graphql';
import { CrudDemoItemListItem } from '../crudDemoItemListItem';
import { List } from '../crudDemoItemList.styles';

export interface CrudDemoItemListContentProps {
  queryRef: PreloadedQuery<crudDemoItemListQuery>;
}

export const CrudDemoItemListContent = ({ queryRef }: CrudDemoItemListContentProps) => {
  const data = usePreloadedQuery(CrudDemoItemListQuery, queryRef);

  return (
    <List>
      {data?.allCrudDemoItems?.edges.map((edge) =>
        edge?.node ? <CrudDemoItemListItem item={edge.node} key={edge.node.id} /> : null
      )}
    </List>
  );
};
