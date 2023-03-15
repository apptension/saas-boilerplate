import { makeExecutableSchema } from '@graphql-tools/schema';
import typeDefs from './api.graphql.chunk';

export default makeExecutableSchema({
  typeDefs,
});
