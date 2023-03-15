import { setupServer } from 'msw/node';

import * as handlers from './handlers';

export const server = setupServer(
  ...Object.values(handlers)
    .filter((v) => typeof v === 'function')
    .map((createMockHandler) => createMockHandler())
);
