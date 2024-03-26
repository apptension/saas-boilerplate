import { DefaultBodyType, PathParams, rest } from 'msw';

import { apiURL } from '../../../../api/helpers';

export const mockGraphQuery = (response?: DefaultBodyType) =>
  rest.post<DefaultBodyType, PathParams>(apiURL('/api/graphql'), (req, res, ctx) => {
    return res(ctx.json(response));
  });

export const mockGraphWS = (response?: DefaultBodyType) =>
  rest.get<DefaultBodyType, PathParams>(apiURL('/api/graphql'), (req, res, ctx) => {
    return res(ctx.json(response));
  });
