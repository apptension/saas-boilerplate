import { ContentfulSys } from '../../contentful';
import { createFactory, makeId } from '../../tests/utils';

export const contentfulSysFactory = createFactory<ContentfulSys>(() => ({
  spaceId: 'space-id',
  environmentId: 'env-id',
  id: makeId(32),
}));
