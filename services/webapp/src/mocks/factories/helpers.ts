import * as faker from 'faker';
import { ContentfulSys } from '../../shared/services/contentful';

export const contentfulSysFactory = (): ContentfulSys => ({
  spaceId: 'space-id',
  environmentId: 'env-id',
  id: faker.random.uuid(),
});
