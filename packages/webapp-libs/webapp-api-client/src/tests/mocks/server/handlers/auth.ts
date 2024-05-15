import { DefaultBodyType, HttpResponse, PathParams, http } from 'msw';

import { AUTH_URL } from '../../../../api/auth';

export const mockRefreshToken = (status = 200) =>
  http.post<PathParams, DefaultBodyType>(AUTH_URL.REFRESH_TOKEN, () => {
    return new HttpResponse(null, {
      status,
    });
  });

export const mockLogout = (status = 200) =>
  http.post<PathParams, any>(AUTH_URL.LOGOUT, () => {
    return new HttpResponse(null, {
      status,
    });
  });
