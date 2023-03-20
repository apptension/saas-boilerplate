import { Sys } from '@sb/webapp-api-client';
import { createFactory, makeId } from '@sb/webapp-api-client/tests/utils';

export const contentfulSysFactory = createFactory<Sys>(() => ({
  spaceId: 'space-id',
  environmentId: 'env-id',
  id: makeId(32),
}));
