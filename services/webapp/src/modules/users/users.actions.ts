import { actionCreator } from '../helpers';
import { User } from './users.types';

const { createPromiseAction } = actionCreator('USERS');

export const fetchUsers = createPromiseAction<void, User[]>('FETCH_USERS');
