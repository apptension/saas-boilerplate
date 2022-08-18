import { makeExecutableSchema } from '@graphql-tools/schema';

export default makeExecutableSchema({
  // eslint-disable-next-line
  typeDefs: require('!!raw-loader!./api.graphql.chunk').default,
});
