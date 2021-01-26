import { rest } from 'msw';
import { UserApiGetData } from '../../../shared/services/api/users/types';
import { USERS_URL } from '../../../shared/services/api/users';
const baseUrl = process.env.REACT_APP_BASE_API_URL;

export const mockGetUsers = (response: UserApiGetData[] = []) =>
  rest.get<void, UserApiGetData[]>([baseUrl, USERS_URL].join(''), (req, res, ctx) => {
    return res(ctx.json(response));
  });
