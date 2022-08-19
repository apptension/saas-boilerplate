import { AuthState, Profile, Role } from '../../modules/auth/auth.types';
import { createFactory } from './factoryCreators';

export const userProfileFactory = createFactory<Profile>(() => ({
  firstName: 'testFirstName',
  lastName: 'testLastName',
  email: 'mock@example.org',
  roles: [Role.ADMIN, Role.USER],
  avatar: 'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/315.jpg',
}));

export const loggedInAuthFactory = createFactory<AuthState>(() => ({
  isLoggedIn: true,
  profile: userProfileFactory(),
}));

export const loggedOutAuthFactory = createFactory<AuthState>(() => ({
  isLoggedIn: false,
}));
