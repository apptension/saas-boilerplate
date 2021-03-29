import { rest } from 'msw';
import { HISTORY_URL } from '../../../shared/services/api/stripe/history';
import { HistoryListApiResponseData } from '../../../shared/services/api/stripe/history/types';
const baseUrl = process.env.REACT_APP_BASE_API_URL;

export const mockListTransactionHistory = (response: HistoryListApiResponseData = []) =>
  rest.get<void, HistoryListApiResponseData>([baseUrl, HISTORY_URL].join(''), (req, res, ctx) => {
    return res(ctx.json(response));
  });
