import { DefaultBodyType, HttpResponse, PathParams, http } from 'msw';

import { apiURL } from '../../../../api/helpers';

export const mockGraphQuery = (response?: DefaultBodyType) =>
  http.post<PathParams>(apiURL('/api/graphql'), () => {
    return HttpResponse.json(response);
  });

export const mockGraphWS = (response?: DefaultBodyType) =>
  http.get<PathParams>(apiURL('/api/graphql'), () => {
    return HttpResponse.json(response);
  });
