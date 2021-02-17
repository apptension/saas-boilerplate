import * as faker from 'faker';
import { AuthState, Profile, Role } from '../../modules/auth/auth.types';
import { Factory } from './types';

export const userProfileFactory: Factory<Profile> = (overrides = {}) => ({
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  roles: faker.random.arrayElements([Role.ADMIN, Role.USER], 2),
  ...overrides,
});

export const loggedInAuthFactory: Factory<AuthState> = (overrides = {}) => ({
  isLoggedIn: true,
  profile: userProfileFactory(),
  ...overrides,
});

export const loggedOutAuthFactory: Factory<AuthState> = (overrides = {}) => ({
  isLoggedIn: false,
  ...overrides,
});
