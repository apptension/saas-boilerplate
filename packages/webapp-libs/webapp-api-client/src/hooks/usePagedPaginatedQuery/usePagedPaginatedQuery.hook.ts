import { NoInfer, QueryHookOptions, TypedDocumentNode, useQuery } from '@apollo/client';
import { PAGE_SIZE_OPTIONS } from '@sb/webapp-core/components/table';
import { flatten, omit, pick } from 'ramda';
import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { InputMaybe, PageCursors } from '../../graphql';

type CursorsInput = {
  first?: InputMaybe<number> | undefined;
  after?: InputMaybe<string> | undefined;
  last?: InputMaybe<number> | undefined;
  before?: InputMaybe<string> | undefined;
};

export const DEFAULT_PAGE_SIZE = 10;

export const filterPageSize = (pageSize?: string) => {
  const pz = pageSize ? parseInt(pageSize, 10) : DEFAULT_PAGE_SIZE;
  if (PAGE_SIZE_OPTIONS.includes(pz)) {
    return pz;
  }
  return DEFAULT_PAGE_SIZE;
};

export const usePagedPaginatedQuery = <
  A extends { [key: string]: any },
  B extends { [key: string]: any },
  C extends { cursor?: string; pageSize?: string; [key: string]: any },
  T extends TypedDocumentNode<Partial<A>, NoInfer<CursorsInput & B>>,
>(
  query: T,
  options: {
    hookOptions?: QueryHookOptions<A, CursorsInput & B>;
    dataKey: keyof A;
    transformVariables?: (searchParams: C) => Partial<B>;
  }
) => {
  const [urlSearchParams, setSearchParams] = useSearchParams({}) as unknown as [URLSearchParams, (params: C) => void];

  const searchParams = Array.from(urlSearchParams.entries()).reduce(
    (acc, [key, value]) => {
      acc[key] === undefined ? (acc[key] = value) : (acc[key] = flatten([acc[key] as string, value]));
      return acc;
    },
    {} as Record<string, string | string[] | boolean>
  );

  const { cursor, pageSize: pageSizeSource, ...toolbarSearchParams } = searchParams;
  const pageSize = filterPageSize(pageSizeSource as string);

  const { data, loading, fetchMore } = useQuery<A, CursorsInput & B>(query, {
    ...options.hookOptions,
    variables: {
      ...(options.hookOptions?.variables || {}),
      first: pageSize,
      after: cursor as string | undefined,
      ...(options.transformVariables?.(searchParams as C) || {}),
    } as CursorsInput & B,
  });

  const loadCursor = useCallback(
    (cursor: string) => {
      fetchMore({
        variables: {
          after: cursor,
        },
        updateQuery: (_, { fetchMoreResult }) => {
          return fetchMoreResult;
        },
      });
    },
    [fetchMore]
  );

  const onPageClick = useCallback(
    (cursor: string) => {
      loadCursor(cursor);
      setSearchParams({ ...searchParams, cursor } as C);
    },
    [loadCursor, setSearchParams, searchParams]
  );

  const onSearchChangeWithCursorClear = useCallback(
    (params: C) => {
      const keepParams = pick(['pageSize'], searchParams);
      setSearchParams(omit(['cursor'], { ...keepParams, ...params }) as C);
    },
    [setSearchParams, searchParams]
  );

  const onSearchReset = useCallback(() => {
    setSearchParams({} as C);
  }, [setSearchParams]);

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      onSearchChangeWithCursorClear({ ...searchParams, pageSize: `${pageSize}` } as C);
    },
    [onSearchChangeWithCursorClear, searchParams]
  );

  useEffect(() => {
    if (loading) return;
    const nodes = data?.[options.dataKey]?.edges || [];
    const { pageCursors = {} } = (data?.[options.dataKey] ?? {}) as { pageCursors?: PageCursors };

    // If the current page is blank and there is a previous page, navigate to the previous page
    // This is to handle the case when the last item on the page is deleted
    if (nodes.length === 0) {
      let nextPage = pageCursors?.previous;
      if (!nextPage || !nextPage?.cursor) {
        nextPage = pageCursors?.around?.[0];
      }
      nextPage?.cursor && !nextPage.isCurrent && nextPage?.cursor !== cursor && onPageClick(nextPage.cursor);
    }
  }, [data, options.dataKey, onPageClick, loading, cursor]);

  return {
    data,
    loading,
    loadCursor,
    searchParams,
    onSearchReset,
    onPageClick,
    onSearchChangeWithCursorClear,
    handlePageSizeChange,
    pageSize,
    toolbarSearchParams,
  };
};
