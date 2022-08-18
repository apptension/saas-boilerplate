import { faker } from '@faker-js/faker';

import { DocumentDemoItemType } from '../../shared/services/graphqlApi/__generated/types';
import { createDeepFactory } from './factoryCreators';

export const documentFactory = createDeepFactory<Partial<DocumentDemoItemType>>(() => ({
  id: faker.datatype.uuid(),
  createdAt: faker.date.past().toISOString(),
  file: {
    name: faker.system.fileName(),
    url: faker.internet.url(),
  },
}));
