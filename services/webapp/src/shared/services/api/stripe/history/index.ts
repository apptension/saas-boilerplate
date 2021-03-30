import { client } from '../../client';
import { HistoryListApiResponseData } from './types';
//<-- IMPORT MODULE API -->

export const HISTORY_URL = '/finances/stripe/charge/';

export const list = async () => {
  const res = await client.get<HistoryListApiResponseData>(HISTORY_URL);
  return res.data;
};
