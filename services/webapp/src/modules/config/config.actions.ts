import { actionCreator } from '../helpers';
import { ContentfulAppConfigPlain } from './config.types';

const { createAction } = actionCreator('CONFIG');

export const setAppConfig = createAction<ContentfulAppConfigPlain>('SET_APP_CONFIG');
