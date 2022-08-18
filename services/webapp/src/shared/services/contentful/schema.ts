import { makeExecutableSchema } from '@graphql-tools/schema';

export default makeExecutableSchema({
  // eslint-disable-next-line
  typeDefs: require('!!raw-loader!../contentful/contentful.graphql.chunk').default,
});
