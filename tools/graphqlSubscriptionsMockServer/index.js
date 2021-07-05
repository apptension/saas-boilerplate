import { ApolloServer } from "apollo-server";
import { resolvers } from "./resolvers.js";
import { readFileSync } from "fs";
import dotenv from "dotenv";

dotenv.config();

const typeDefs = readFileSync(
  "../../services/webapp/graphql/schema/schema.graphql"
).toString("utf-8");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  subscriptions: {
    path: "/subscriptions",
  },
});

server.listen().then(({ subscriptionsUrl }) => {
  console.log(`🚀  WS Server ready at ${subscriptionsUrl}`);
});
