import { makeExecutableSchema } from '@graphql-tools/schema';

import typeDefs from './contentful.graphql.chunk';

export default makeExecutableSchema({
  typeDefs,
});
