import { GraphQLFormattedError } from 'graphql';

/**
 * Apollo Client error type that includes both GraphQL and network errors
 */
export interface ApolloErrorLike extends Error {
  graphQLErrors?: ReadonlyArray<GraphQLFormattedError>;
  networkError?: Error | null;
  extraInfo?: any;
}
