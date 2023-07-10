import { QueryHookOptions, TypedDocumentNode, useQuery } from '@apollo/client';
import { Exact, InputMaybe } from '@sb/webapp-api-client/graphql';
import { useEffect, useState } from 'react';

type CursorsInput = Exact<{
  first?: InputMaybe<number> | undefined;
  after?: InputMaybe<string> | undefined;
  last?: InputMaybe<number> | undefined;
  before?: InputMaybe<string> | undefined;
}>;

type ExtractGeneric<Type> = Type extends TypedDocumentNode<infer QueryData> ? QueryData : never;

export const usePaginationQuery = <T extends TypedDocumentNode>(
  query: T,
  options: {
    hookOptions: QueryHookOptions<ExtractGeneric<T>, CursorsInput>;
    dataKey: keyof ExtractGeneric<T>;
  }
) => {
  const [cachedCursrors, setCachedCursors] = useState<Array<string>>([]);
  const [hasPrevious, setHasPrevious] = useState<boolean>(false);
  const [hasNext, setHasNext] = useState<boolean>(false);

  const { data, loading, fetchMore } = useQuery<ExtractGeneric<T>, CursorsInput>(query, options.hookOptions);

  useEffect(() => {
    setHasPrevious(cachedCursrors.length === 0);
    setHasNext(data?.[options.dataKey]?.pageInfo.hasNextPage ?? false);
  }, [data]);

  const loadNext = () => {
    if (data) {
      const p = data[options.dataKey];

      if (p) {
        const { endCursor } = p.pageInfo;

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
