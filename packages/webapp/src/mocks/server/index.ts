import { setupServer } from 'msw/node';
import * as handlers from './handlers';

export const server = setupServer(...Object.values(handlers).map((createMockHandler) => createMockHandler()));
