import { PreloadedQuery, usePreloadedQuery } from 'react-relay';
import { CrudDemoItemListItem } from '../crudDemoItemListItem';
import { List } from '../crudDemoItemList.styles';
import { mapConnection } from '../../../../shared/utils/graphql';
import crudDemoItemListQueryGraphql, { crudDemoItemListQuery } from '../__generated__/crudDemoItemListQuery.graphql';

export type CrudDemoItemListContentProps = {
  queryRef: PreloadedQuery<crudDemoItemListQuery>;
};

export const CrudDemoItemListContent = ({ queryRef }: CrudDemoItemListContentProps) => {
  const { allCrudDemoItems } = usePreloadedQuery(crudDemoItemListQueryGraphql, queryRef);

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
