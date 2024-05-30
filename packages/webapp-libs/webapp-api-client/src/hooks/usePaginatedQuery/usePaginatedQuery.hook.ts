import { NoInfer, QueryHookOptions, TypedDocumentNode, useQuery } from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';
import { InputMaybe } from '@sb/webapp-api-client/graphql';

type CursorsInput = {
  first?: InputMaybe<number> | undefined;
  after?: InputMaybe<string> | undefined;
  last?: InputMaybe<number> | undefined;
  before?: InputMaybe<string> | undefined;
};

/**
 * An usePaginatedQuery is a hook that allows you to retrieve data with ready-made logic for cursor-based bidirectional pagination.
 * Underneath, it uses [`useQuery`](https://www.apollographql.com/docs/react/development-testing/static-typing/#usequery)
 * function exported by `@apollo/client`.
 *
 * @example
 * ```tsx showLineNumbers
 * import { usePaginatedQuery } from '@sb/webapp-api-client/hooks';
 * import { Pagination } from '@sb/webapp-core/components/pagination';
 *
 * const ITEMS_PER_PAGE = 8;
 *
 * const CrudDemoList = () => {
 *   const { data, loading, hasNext, hasPrevious, loadNext, loadPrevious } =
 *     usePaginatedQuery(crudDemoItemListQuery, {
 *       hookOptions: {
 *         variables: {
 *           first: ITEMS_PER_PAGE,
 *         },
 *       },
 *       dataKey: 'allCrudDemoItems',
 *     });
 *
 *   return (
 *     <Pagination
 *       hasNext={hasNext}
 *       hasPrevious={hasPrevious}
 *       loadNext={loadNext}
 *       loadPrevious={loadPrevious}
 *     />
 *   );
 * };
 * ```
 *
 */

export const usePaginatedQuery = <
  A extends { [key: string]: any },
  B extends { [key: string]: any },
  T extends TypedDocumentNode<Partial<A>, NoInfer<CursorsInput & B>>,
>(
  query: T,
  options: {
    hookOptions?: QueryHookOptions<A, CursorsInput & B>;
    dataKey: keyof A;
  }
) => {
  const [cachedCursors, setCachedCursors] = useState<Array<string>>([]);
  const [hasPrevious, setHasPrevious] = useState<boolean>(false);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const { data, loading, fetchMore } = useQuery<A, CursorsInput & B>(query, options.hookOptions);

  useEffect(() => {
    const currentEndCursor = data?.[options.dataKey]?.pageInfo.endCursor;
    const isFirstEndCursor = cachedCursors.indexOf(currentEndCursor) === 0;
    if (isFirstEndCursor) setCachedCursors([]);
  }, [data, cachedCursors, options.dataKey]);

  useEffect(() => {
    setHasPrevious(cachedCursors.length > 0);
    setHasNext(data?.[options.dataKey]?.pageInfo.hasNextPage ?? false);
  }, [data, cachedCursors.length, options.dataKey]);

  useEffect(() => {
    const setCacheToFirstPage = () => {
      fetchMore({
        updateQuery: (_, { fetchMoreResult }) => fetchMoreResult,
      });
    };

    return setCacheToFirstPage;
  }, [fetchMore]);

  const loadNext = useCallback(() => {
    const queryData = data?.[options.dataKey];
    const endCursor = queryData?.pageInfo.endCursor;

    fetchMore({
      variables: {
        after: endCursor,
      },
      updateQuery: (_, { fetchMoreResult }) => {
        return fetchMoreResult;
      },
    }).then(() => {
      setCachedCursors((prev) => [...prev, endCursor]);
    });
  }, [data, setCachedCursors, fetchMore, options.dataKey]);

  const loadPrevious = useCallback(() => {
    const newCachedCursors = cachedCursors.slice(0, -1);
    const lastEndCursor = newCachedCursors.length > 0 ? newCachedCursors[newCachedCursors.length - 1] : undefined;

    fetchMore({
      variables: {
        after: lastEndCursor,
      },
      updateQuery: (_, { fetchMoreResult }) => {
        return fetchMoreResult;
      },
    }).then(() => {
      setCachedCursors(newCachedCursors);
    });
  }, [cachedCursors, setCachedCursors, fetchMore]);

  return { data, loading, hasNext, hasPrevious, loadNext, loadPrevious };
};
