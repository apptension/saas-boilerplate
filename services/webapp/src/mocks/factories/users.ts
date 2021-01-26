import * as faker from 'faker';

import { User } from '../../modules/users/users.types';
import { Factory } from './types';

export const userFactory: Factory<User> = (overrides) => ({
  id: faker.random.uuid(),
  login: faker.internet.userName(),
  name: faker.fake('{{name.firstName}} {{name.lastName}}'),
  displayName: faker.name.firstName(),
  email: faker.internet.email(),
  ...overrides,
});
