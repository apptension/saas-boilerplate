import { rest, DefaultBodyType, PathParams } from 'msw';
import { HISTORY_URL } from '../../../shared/services/api/stripe/history';
import { HistoryListApiResponseData } from '../../../shared/services/api/stripe/history/types';

export const mockListTransactionHistory = (response: HistoryListApiResponseData = []) =>
  rest.get<DefaultBodyType, PathParams, HistoryListApiResponseData>(HISTORY_URL.LIST, (req, res, ctx) => {
    return res(ctx.json(response));
  });
