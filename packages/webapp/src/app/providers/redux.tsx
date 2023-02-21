import { ReactNode } from 'react';
import { Provider } from 'react-redux';

import { setupStoreInterceptors } from '../../shared/services/api/client';
import configureStore from '../config/store';

const initialState = {};
export const store = configureStore(initialState);
setupStoreInterceptors(store);

export const ReduxProvider = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;
