import { ENV } from '../../../app/config/env';

export const url = `https://graphql.contentful.com/content/v1/spaces/${ENV.CONTENTFUL_SPACE}/environments/${ENV.CONTENTFUL_ENV}?access_token=${ENV.CONTENTFUL_TOKEN}`;
