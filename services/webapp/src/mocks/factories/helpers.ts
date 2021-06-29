import * as faker from 'faker';
import { ContentfulSys } from '../../shared/services/contentful';
import { createFactory } from './factoryCreators';

export const contentfulSysFactory = createFactory<ContentfulSys>(() => ({
  spaceId: 'space-id',
  environmentId: 'env-id',
  id: faker.datatype.uuid(),
}));
