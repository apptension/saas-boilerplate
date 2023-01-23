import { useCallback, useState } from 'react';
import { PreloadedQuery, fetchQuery, useQueryLoader, useRelayEnvironment } from 'react-relay';
import {
  CacheConfig,
  DisposeFn,
  FetchQueryFetchPolicy,
  GraphQLTaggedNode,
  OperationType,
  VariablesOf,
} from 'relay-runtime';

type UseUnsuspendedQueryLoaderReturnType<TQuery extends OperationType> = [
  boolean,
  PreloadedQuery<TQuery> | null | undefined,
  (
    variables: VariablesOf<TQuery>,
    options?: {
      networkCacheConfig?: CacheConfig | null | undefined;
      fetchPolicy?: FetchQueryFetchPolicy | null | undefined;
    }
  ) => void,
  DisposeFn
];

export function useUnsuspendedQueryLoader<TQuery extends OperationType>(
  preloadableRequest: GraphQLTaggedNode,
  initialQueryReference?: PreloadedQuery<TQuery> | null
): UseUnsuspendedQueryLoaderReturnType<TQuery> {
  const environment = useRelayEnvironment();
  const [queryRef, loadQuery, disposeQuery] = useQueryLoader(preloadableRequest, initialQueryReference);
  const [isInFlight, setIsInFlight] = useState(false);
  const refresh = useCallback(
    (
      variables: VariablesOf<TQuery>,
      cacheConfig?: {
        networkCacheConfig?: CacheConfig | null | undefined;
        fetchPolicy?: FetchQueryFetchPolicy | null | undefined;
      } | null
    ) => {
      setIsInFlight(true);

      fetchQuery(environment, preloadableRequest, variables, cacheConfig).subscribe({
        complete() {
          loadQuery(variables, { fetchPolicy: 'store-or-network' });
          setIsInFlight(false);
        },
        error() {
          setIsInFlight(false);
        },
      });
    },
    [environment, preloadableRequest, loadQuery]
  );

  return [isInFlight, queryRef, refresh, disposeQuery];
}
