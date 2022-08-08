import { faker } from '@faker-js/faker';
import { AuthState, Profile, Role } from '../../modules/auth/auth.types';
import { createFactory } from './factoryCreators';

export const userProfileFactory = createFactory<Profile>(() => ({
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  roles: faker.helpers.arrayElements([Role.ADMIN, Role.USER], 2),
  avatar: faker.internet.avatar(),
}));

export const loggedInAuthFactory = createFactory<AuthState>(() => ({
  isLoggedIn: true,
  profile: userProfileFactory(),
}));

export const loggedOutAuthFactory = createFactory<AuthState>(() => ({
  isLoggedIn: false,
}));
