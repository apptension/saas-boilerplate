import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import configureStore from '../config/store';
import { setupStoreInterceptors } from '../../shared/services/api/client';

const initialState = {};
const store = configureStore(initialState);
setupStoreInterceptors(store);

export const ReduxProvider = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;
