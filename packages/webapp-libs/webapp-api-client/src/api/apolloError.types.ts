import { GraphQLFormattedError } from 'graphql';

/**
 * Apollo Client error type that includes both GraphQL and network errors.
 * Updated for Apollo Client 4 which may use different property names.
 */
export interface ApolloErrorLike extends Error {
  graphQLErrors?: ReadonlyArray<GraphQLFormattedError>;
  errors?: ReadonlyArray<GraphQLFormattedError>;
  result?: { errors?: ReadonlyArray<GraphQLFormattedError> };
  networkError?: Error | null;
  extraInfo?: any;
}

/**
 * Extracts GraphQL errors from Apollo Client error object.
 * Handles both Apollo Client 3.x (graphQLErrors) and 4.x (errors, result.errors) structures.
 *
 * @param error - The Apollo Client error object
 * @returns Array of GraphQL errors or undefined if none found
 */
export const extractGraphQLErrors = (
  error: ApolloErrorLike | any
): ReadonlyArray<GraphQLFormattedError> | undefined => {
  return error?.graphQLErrors || error?.errors || error?.result?.errors;
};
