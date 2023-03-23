import { useIntl } from 'react-intl';
import { generatePath } from 'react-router-dom';

import { ENV } from '../../config/env';
import { getLocalePath } from '../../utils';

/**
 * Intended to use in the emails
 * */
export const useGenerateAbsoluteLocalePath = () => {
  const { locale } = useIntl();

  return (path: string, params: Record<string, string | number> = {}) => {
    const routePath = getLocalePath(path);
    const localPath = generatePath(routePath, { ...params, lang: locale });
    const WEB_APP_URL = ENV.WEB_APP_URL ?? '';
    const separator = WEB_APP_URL.endsWith('/') || localPath.startsWith('/') ? '' : '/';

    return [WEB_APP_URL ?? '', localPath].join(separator);
  };
};
