import { CrudDemoItemListQueryQuery } from '@sb/webapp-api-client/graphql';

export const isCrudDataEmpty = (data: CrudDemoItemListQueryQuery): boolean => {
  if (data.allCrudDemoItems && data.allCrudDemoItems.edges.length <= 0) return true;

  return false;
};
