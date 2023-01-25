import { MockedResponse } from '@apollo/client/testing';
import { DocumentNode } from 'graphql/language';

export function makeId(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const connectionFromArray = <T extends Record<string, any>>(arr: T[] = []) => {
  if (!arr || arr.length === 0) {
    return {
      edges: [],
      totalCount: 0,
      count: 0,
      endCursorOffset: 0,
      startCursorOffset: 0,
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  return {
    edges: arr.map((node) => ({ node })),
    totalCount: arr.length,
    count: arr.length,
    endCursorOffset: arr.length,
    startCursorOffset: 0,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
};

type ComposeMockedQueryResultProps = {
  data: Record<string, any>;
  variables?: Record<string, any>;
};

export const composeMockedQueryResult = (
  query: DocumentNode,
  { variables, data }: ComposeMockedQueryResultProps
): MockedResponse => ({
  request: {
    query,
    variables,
  },
  result: {
    data,
    /*TODO: ADD ERRORS */
  },
});

type ComposeMockedListQueryResultProps = ComposeMockedQueryResultProps & {
  data: Array<any>;
};

export const composeMockedListQueryResult = (
  query: DocumentNode,
  key: string,
  typename: string,
  { variables, data }: ComposeMockedListQueryResultProps
): MockedResponse =>
  composeMockedQueryResult(query, {
    variables,
    data: {
      [key]: {
        edges: data.map((obj) => ({ node: { __typename: typename, ...obj } })),
      },
    },
  });

export const composeMockedPaginatedListQueryResult = (
  query: DocumentNode,
  key: string,
  typename: string,
  resultProps: ComposeMockedListQueryResultProps,
  pageInfo: { endCursor: string; hasNextPage: boolean }
): MockedResponse => {
  const {
    request,
    result = { data: { [key]: {} } },
    ...other
  } = composeMockedListQueryResult(query, key, typename, resultProps);
  return {
    request,
    result: {
      data: {
        [key]: {
          edges: result.data[key].edges ?? [],
          pageInfo: {
            __typename: 'PageInfo',
            ...pageInfo,
          },
        },
      },
    },
    ...other,
  };
};
