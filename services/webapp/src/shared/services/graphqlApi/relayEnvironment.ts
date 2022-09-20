import {
  commitLocalUpdate,
  Environment,
  Observable,
  RecordSource,
  RequestParameters,
  Store,
  Variables,
} from 'relay-runtime';
import {
  authMiddleware,
  ConcreteBatch,
  RelayNetworkLayer,
  retryMiddleware,
  urlMiddleware,
} from 'react-relay-network-modern';
import { createClient } from 'graphql-ws';

import { stitchSchemas } from '@graphql-tools/stitch';

import { graphql } from 'graphql';

import { RecordSourceSelectorProxy } from 'relay-runtime/lib/store/RelayStoreTypes';
import { url as contentfulUrl } from '../contentful';
import { ENV } from '../../../app/config/env';
import { apiURL } from '../api/helpers';
import contentfulSchema from '../contentful/schema';
import { refreshToken } from '../api/auth';
import apiSchema from './schema';

export const subscriptionClient = createClient({
  url: ENV.SUBSCRIPTIONS_URL,
  lazy: true,
  connectionAckWaitTimeout: 15000,
  connectionParams: () => {
    return {};
  },
  on: {
    error: async () => {
      await refreshToken();
    },
  },
});

const subscribe = ({ text, name }: RequestParameters, variables: Variables) => {
  return Observable.create((sink) => {
    if (!text) {
      return sink.error(new Error('Operation text cannot be empty'));
    }
    return subscriptionClient.subscribe(
      {
        operationName: name,
        query: text,
        variables,
      },
      sink
    );
  });
};

enum SchemaType {
  API,
  Contentful,
}

/**
 * We are using schema stitching to re-create a single schema that Relay is using to detect which original
 * schema chunk the queried field or mutation comes from.
 *
 * Unfortunately I didn't find any built-in function to check for something like this, so I abuse executors in a very
 * hacky way to achieve this result. The idea is to perform a fake operation on the stitched schema and the decision
 * is based on the specific executor of a sub-schema called
 */
const getSchemaTypeForRequest = async (req: any) => {
  let schemaType = null;
  const operation: ConcreteBatch = req.operation;
  const gatewaySchema = stitchSchemas({
    subschemas: [
      {
        schema: apiSchema,
        executor: async () => {
          schemaType = SchemaType.API;
          return {};
        },
      },
      {
        schema: contentfulSchema,
        executor: async () => {
          schemaType = SchemaType.Contentful;
          return {};
        },
      },
    ],
  });

  if (operation?.text) {
    await graphql({
      schema: gatewaySchema,
      source: operation.text,
      variableValues: req.variables,
    });
  }

  return schemaType;
};

const network = new RelayNetworkLayer(
  [
    urlMiddleware({
      url: async (req) => {
        const schemaType = await getSchemaTypeForRequest(req);
        if (schemaType === SchemaType.Contentful) {
          return contentfulUrl;
        }
        return apiURL('/graphql/');
      },
    }),
    retryMiddleware({
      retryDelays: () => 1000,
      statusCodes: [500, 503, 504],
      allowMutations: true,
      allowFormData: true,
    }),
    authMiddleware({
      allowEmptyToken: true,
      tokenRefreshPromise: async (req) => {
        const schemaType = await getSchemaTypeForRequest(req);
        if (schemaType === SchemaType.API) {
          await refreshToken();
        }
        return '';
      },
    }),
  ],
  // @ts-ignore
  { noThrow: true, subscribeFn: subscribe }
);

export const relayEnvironment = new Environment({
  network,
  store: new Store(new RecordSource()),
});
relayEnvironment.getStore().snapshot();

export const invalidateRelayStore = () => {
  commitLocalUpdate(relayEnvironment, (store) => {
    (store as RecordSourceSelectorProxy).invalidateStore();
  });
  relayEnvironment.getStore().restore();
  relayEnvironment.getStore().snapshot();
};
