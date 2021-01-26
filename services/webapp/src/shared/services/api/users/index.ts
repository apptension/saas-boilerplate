import { client } from '../client';
import { UserApiGetData } from './types';

export const USERS_URL = '/users.json';
export const USER_URL = '/user.json';

export const get = async (id: string) => {
  const res = await client.get<UserApiGetData>(USER_URL);
  return res.data;
};

export const list = async () => {
  const res = await client.get<UserApiGetData[]>(USERS_URL);
  return res.data;
};
