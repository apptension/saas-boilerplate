import { client } from '../../client';
import { apiURLs } from '../../helpers';
import { HistoryListApiResponseData } from './types';
//<-- IMPORT MODULE API -->

export const HISTORY_URL = apiURLs('/finances/stripe/charge/', {
  LIST: '',
});

export const list = async () => {
  const res = await client.get<HistoryListApiResponseData>(HISTORY_URL.LIST);
  return res.data;
};
