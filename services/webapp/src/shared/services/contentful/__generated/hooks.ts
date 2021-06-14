/* eslint-disable */
import * as Types from './types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

export const AppConfigDocument = gql`
    query appConfig {
  appConfigCollection(limit: 1) {
    items {
      name
      privacyPolicy
      termsAndConditions
    }
  }
}
    `;

/**
 * __useAppConfigQuery__
 *
 * To run a query within a React component, call `useAppConfigQuery` and pass it any options that fit your needs.
 * When your component renders, `useAppConfigQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAppConfigQuery({
 *   variables: {
 *   },
 * });
 */
export function useAppConfigQuery(baseOptions?: Apollo.QueryHookOptions<Types.ContentfulAppConfigQuery, Types.ContentfulAppConfigQueryVariables>) {
        return Apollo.useQuery<Types.ContentfulAppConfigQuery, Types.ContentfulAppConfigQueryVariables>(AppConfigDocument, baseOptions);
      }
export function useAppConfigLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.ContentfulAppConfigQuery, Types.ContentfulAppConfigQueryVariables>) {
          return Apollo.useLazyQuery<Types.ContentfulAppConfigQuery, Types.ContentfulAppConfigQueryVariables>(AppConfigDocument, baseOptions);
        }
export type AppConfigQueryHookResult = ReturnType<typeof useAppConfigQuery>;
export type AppConfigLazyQueryHookResult = ReturnType<typeof useAppConfigLazyQuery>;
export type AppConfigQueryResult = Apollo.QueryResult<Types.ContentfulAppConfigQuery, Types.ContentfulAppConfigQueryVariables>;
export const AllDemoItemsDocument = gql`
    query allDemoItems {
  demoItemCollection {
    items {
      sys {
        id
      }
      title
      image {
        title
        url
      }
    }
  }
}
    `;

/**
 * __useAllDemoItemsQuery__
 *
 * To run a query within a React component, call `useAllDemoItemsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllDemoItemsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllDemoItemsQuery({
 *   variables: {
 *   },
 * });
 */
export function useAllDemoItemsQuery(baseOptions?: Apollo.QueryHookOptions<Types.ContentfulAllDemoItemsQuery, Types.ContentfulAllDemoItemsQueryVariables>) {
        return Apollo.useQuery<Types.ContentfulAllDemoItemsQuery, Types.ContentfulAllDemoItemsQueryVariables>(AllDemoItemsDocument, baseOptions);
      }
export function useAllDemoItemsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.ContentfulAllDemoItemsQuery, Types.ContentfulAllDemoItemsQueryVariables>) {
          return Apollo.useLazyQuery<Types.ContentfulAllDemoItemsQuery, Types.ContentfulAllDemoItemsQueryVariables>(AllDemoItemsDocument, baseOptions);
        }
export type AllDemoItemsQueryHookResult = ReturnType<typeof useAllDemoItemsQuery>;
export type AllDemoItemsLazyQueryHookResult = ReturnType<typeof useAllDemoItemsLazyQuery>;
export type AllDemoItemsQueryResult = Apollo.QueryResult<Types.ContentfulAllDemoItemsQuery, Types.ContentfulAllDemoItemsQueryVariables>;
export const DemoItemDocument = gql`
    query demoItem($itemId: String!) {
  demoItem(id: $itemId) {
    title
    description
    image {
      title
      url
    }
  }
}
    `;

/**
 * __useDemoItemQuery__
 *
 * To run a query within a React component, call `useDemoItemQuery` and pass it any options that fit your needs.
 * When your component renders, `useDemoItemQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDemoItemQuery({
 *   variables: {
 *      itemId: // value for 'itemId'
 *   },
 * });
 */
export function useDemoItemQuery(baseOptions: Apollo.QueryHookOptions<Types.ContentfulDemoItemQuery, Types.ContentfulDemoItemQueryVariables>) {
        return Apollo.useQuery<Types.ContentfulDemoItemQuery, Types.ContentfulDemoItemQueryVariables>(DemoItemDocument, baseOptions);
      }
export function useDemoItemLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.ContentfulDemoItemQuery, Types.ContentfulDemoItemQueryVariables>) {
          return Apollo.useLazyQuery<Types.ContentfulDemoItemQuery, Types.ContentfulDemoItemQueryVariables>(DemoItemDocument, baseOptions);
        }
export type DemoItemQueryHookResult = ReturnType<typeof useDemoItemQuery>;
export type DemoItemLazyQueryHookResult = ReturnType<typeof useDemoItemLazyQuery>;
export type DemoItemQueryResult = Apollo.QueryResult<Types.ContentfulDemoItemQuery, Types.ContentfulDemoItemQueryVariables>;