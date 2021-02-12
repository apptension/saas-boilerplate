import { GraphQLClient } from 'graphql-request';
import { getSdk } from './__generated/types';

export * from './types';
export * from './__generated/types';

const url = `https://graphql.contentful.com/content/v1/spaces/${process.env.REACT_APP_CONTENTFUL_SPACE}/environments/${process.env.REACT_APP_CONTENTFUL_ENV}?access_token=${process.env.REACT_APP_CONTENTFUL_TOKEN}`;

const gqlClientCore = new GraphQLClient(url);
export const client = getSdk(gqlClientCore);
