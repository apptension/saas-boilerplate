import axios, { AxiosResponse } from 'axios';
import { BAD_REQUEST, UNAUTHORIZED } from 'http-status-codes';
import { Store } from 'redux';
import { GlobalState } from '../../../config/reducers';
import history from '../../utils/history';
import { DEFAULT_LOCALE } from '../../../i18n';
import { selectLocalesLanguage } from '../../../modules/locales/locales.selectors';
import { ROUTES } from '../../../routes/app.constants';
import { AUTH_TOKEN_REFRESH_URL, refreshToken } from './auth';

export const validateStatus = (status: number) => (status >= 200 && status < 300) || status === BAD_REQUEST;

export const createRefreshTokenInterceptor = (store: Store<GlobalState>) => ({
  onFulfilled: (response: AxiosResponse) => response,
  onRejected: async (error: any) => {
    const redirectToLogin = () => {
      const locale = selectLocalesLanguage(store.getState());
      history.push(`/${locale ?? DEFAULT_LOCALE}${ROUTES.login}`);
    };

    if (error.response.status !== UNAUTHORIZED) {
      return Promise.reject(error);
    }

    if (error.config.url === process.env.REACT_APP_BASE_API_URL + AUTH_TOKEN_REFRESH_URL) {
      redirectToLogin();
      return Promise.reject(error);
    }

    try {
      await refreshToken();
      return axios.request({
        ...error.config,
        baseURL: '/',
      });
    } catch (ex) {
      redirectToLogin();
      return Promise.reject(error);
    }
  },
});
