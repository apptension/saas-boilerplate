import { actionCreator } from '../helpers/actionCreator';
import { ContentfulAppConfigPlain } from './config.types';

const { createAction } = actionCreator('CONFIG');

export const setAppConfig = createAction<ContentfulAppConfigPlain>('SET_APP_CONFIG');
