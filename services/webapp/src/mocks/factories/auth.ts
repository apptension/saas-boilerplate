import * as faker from 'faker';
import { AuthState, Profile, Role } from '../../modules/auth/auth.types';
import { createFactory } from './factoryCreators';

export const userProfileFactory = createFactory<Profile>(() => ({
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  roles: faker.random.arrayElements([Role.ADMIN, Role.USER], 2),
}));

export const loggedInAuthFactory = createFactory<AuthState>(() => ({
  isLoggedIn: true,
  profile: userProfileFactory(),
}));

export const loggedOutAuthFactory = createFactory<AuthState>(() => ({
  isLoggedIn: false,
}));
