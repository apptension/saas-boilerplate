import { DefaultBodyType, PathParams, rest } from 'msw';

import { apiURL } from '../../../../api/helpers';

export const mockGraphQuery = (response: DefaultBodyType) =>
  rest.post<DefaultBodyType, PathParams>(apiURL('/graphql'), (req, res, ctx) => {
    return res(ctx.json(response));
  });
