import { ContentfulSys } from '../../shared/services/contentful';
import { makeId } from '../../tests/utils/fixtures';
import { createFactory } from './factoryCreators';

export const contentfulSysFactory = createFactory<ContentfulSys>(() => ({
  spaceId: 'space-id',
  environmentId: 'env-id',
  id: makeId(32),
}));
