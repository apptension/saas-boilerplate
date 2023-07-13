import { MockedResponse } from '@apollo/client/testing';
import { GraphQLError } from 'graphql/error';
import { DocumentNode } from 'graphql/language';

/**
 * Generates a random ID string of the specified length.
 *
 * @param length - The length of the ID string to generate.
 * @returns A random ID string.
 */
export function makeId(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export type PageInfo = {
  endCursor: string;
  hasNextPage: boolean;
  __typename: string;
  startCursor: string;
  hasPreviousPage: boolean;
};

type ComposeMockedQueryResultProps = {
  data: Record<string, any>;
  variables?: Record<string, any>;
  errors?: GraphQLError[];
};

/**
 * Helper function that will compose given GraphQL query and other params like `variables`, `data` or `errors` into
 * [Apollo mock format](https://www.apollographql.com/docs/react/development-testing/testing#defining-mocked-responses)
 * that is used by `MockedProvider`. It will also wrap the `result` function with `jest.fn` which is required by
 * [`waitForApolloMocks`](./tests_utils_rendering#waitforapollomocks) returned from
 * [`render`](./tests_utils_rendering#render) and [`renderHook`](./tests_utils_rendering#renderhook) methods.
 *
 * @example
 * Example of confirm email mutation mock that is used in tests to mock successful query result:
 * ```ts
 *    const requestMock = composeMockedQueryResult(authConfirmUserEmailMutation, {
 *      variables: {
 *        input: { user, token },
 *      },
 *      data: {
 *        confirm: {
 *          ok: true,
 *        },
 *      },
 *    });
 * ```
 *
 * @param query
 * @param variables
 * @param data
 * @param errors
 */
export function composeMockedQueryResult<T extends DocumentNode>(
  query: T,
  { variables, data, errors }: ComposeMockedQueryResultProps
): MockedResponse {
  const result = {
    data,
    errors,
  };

  return {
    request: {
      query,
      variables,
    },
    // @ts-ignore
    result: jest.fn ? jest.fn(() => result) : () => structuredClone(result),
  };
}

type ComposeMockedListQueryResultProps = ComposeMockedQueryResultProps & {
  data: Array<any>;
  pageInfo?: PageInfo;
  additionalData?: Record<string, any>;
};

const defaultPageInfo = {
  endCursor: 'YXJyYXljb25uZWN0aW9uOjM=',
  hasNextPage: false,
  __typename: 'PageInfo',
};

/**
 * Maps an array of data to a Relay-style edges object.
 *
 * @param data - The array of data to map.
 * @param typename - The typename of the nodes in the edges.
 * @param pageInfo - Optional PageInfo object.
 * @returns The mapped Relay-style edges object.
 */
export const mapRelayEdges = (data: Array<any>, typename: string, pageInfo?: PageInfo) => {
  return {
    edges: data.map((obj) => ({ node: { __typename: typename, ...obj }, cursor: defaultPageInfo.endCursor })),
    pageInfo: pageInfo || defaultPageInfo,
  };
};

/**
 * Helper function that composes a mocked list query result. It extends
 * [`composeMockedQueryResult`](#composemockedqueryresult) functionality by mapping the `data` argument using
 * [`mapRelayEdges`](#maprelayedges).
 *
 * @example
 *
 * ```ts
 * const data = [
 *   { id: 1, name: 'First item' },
 *   { id: 2, name: 'Second item' },
 * ];
 * const requestMock = composeMockedListQueryResult(crudDemoItemListQuery, 'allCrudDemoItems', 'CrudDemoItemType', {
 *   data,
 * });
 * ```
 *
 * @param query - The GraphQL query document.
 * @param key - The key for the main data object.
 * @param typename - The typename of the nodes in the list.
 * @param variables - The query variables.
 * @param data - The list data array.
 * @param pageInfo - Optional PageInfo object.
 * @param additionalData - Optional additional data to include.
 * @returns The composed mocked list query result.
 */
export const composeMockedListQueryResult = (
  query: DocumentNode,
  key: string,
  typename: string,
  { variables, data, pageInfo, additionalData = {} }: ComposeMockedListQueryResultProps
): MockedResponse => {
  const composedData = {
    [key]: mapRelayEdges(data, typename, pageInfo),
    ...additionalData,
  } as Record<string, any>;

  return composeMockedQueryResult(query, {
    variables,
    data: composedData,
  });
};

/**
 * Helper function that composes a mocked nested list query result. It is using
 * [`composeMockedQueryResult`](#composemockedqueryresult) and map `data` to `{ [key]: { [listKey]: data } }`.
 * Additionally it adds `__typename` value to each `data` element.
 *
 * :::note
 * If the `listKey` is set to `edges` it will also map each `data` element to `{ node: dataElement }`
 * :::
 *
 * @param query - The GraphQL query document.
 * @param key - The key for the main data object.
 * @param listKey - The key for the nested list.
 * @param typename - The typename of the nodes in the list.
 * @param data - The nested list data array.
 * @param variables - The query variables.
 * @returns The composed mocked nested list query result.
 */
export const composeMockedNestedListQueryResult = (
  query: DocumentNode,
  key: string,
  listKey: string,
  typename: string,
  { data, variables }: ComposeMockedListQueryResultProps
): MockedResponse =>
  composeMockedQueryResult(query, {
    variables,
    data: {
      [key]: {
        [listKey]: data.map((obj) => {
          const result = { __typename: typename, ...obj };
          if (listKey === 'edges') return { node: result };
          return result;
        }),
      },
    },
  });

/**
 * Helper function that composes a mocked paginated list query result. It is using
 * [`composeMockedListQueryResult`](#composemockedlistqueryresult) function and adds additional `pageInfo` object to the
 * result.
 *
 * @param query - The GraphQL query document.
 * @param key - The key for the main data object.
 * @param typename - The typename of the nodes in the list.
 * @param resultProps - Props for composing a mocked list query result.
 * @param pageInfo - PageInfo object for pagination.
 * @returns The composed mocked paginated list query result.
 */
export const composeMockedPaginatedListQueryResult = (
  query: DocumentNode,
  key: string,
  typename: string,
  resultProps: ComposeMockedListQueryResultProps,
  pageInfo: Pick<PageInfo, 'endCursor' | 'hasNextPage' | 'hasPreviousPage' | 'startCursor'>
): MockedResponse => {
  return composeMockedListQueryResult(query, key, typename, {
    ...resultProps,
    pageInfo: {
      __typename: 'PageInfo',
      ...pageInfo,
    },
  });
};
