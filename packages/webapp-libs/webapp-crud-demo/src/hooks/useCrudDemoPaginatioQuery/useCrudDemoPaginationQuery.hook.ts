import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { crudDemoItemListQuery } from '@sb/webapp-crud-demo/routes/crudDemoItem/crudDemoItemList/crudDemoItemList.component';

export const useCrudDemoPaginationQuery = (options?: any) => {
  const [cachedCursrors, setCachedCursors] = useState<Array<string>>([]);
  const [hasPrevious, setHasPrevious] = useState<boolean>(false);
  const [hasNext, setHasNext] = useState<boolean>(false);

  const { data, loading, fetchMore } = useQuery(crudDemoItemListQuery, options);

  useEffect(() => {
    setHasPrevious(cachedCursrors.length === 0);
    setHasNext(data?.allCrudDemoItems?.pageInfo.hasNextPage ?? false);
  }, [data]);

  const loadNext = () => {
    if (data && data.allCrudDemoItems) {
      const { endCursor } = data.allCrudDemoItems.pageInfo;

      if (endCursor) {
        setCachedCursors((prev) => [...prev, endCursor]);
      }

      fetchMore({
        variables: {
          after: endCursor,
        },
        updateQuery: (_, { fetchMoreResult }) => {
          return fetchMoreResult;
        },
      });
    }
  };

  const loadPrevious = () => {
    const newCachedCursors = cachedCursrors.slice(0, -1);

    setCachedCursors(newCachedCursors);

    const lastEndCursor = newCachedCursors.length > 0 ? newCachedCursors[newCachedCursors.length - 1] : undefined;
    fetchMore({
      variables: {
        after: lastEndCursor,
      },
      updateQuery: (_, { fetchMoreResult }) => {
        return fetchMoreResult;
      },
    });
  };

  return { data, loading, hasNext, hasPrevious, loadNext, loadPrevious };
};
