import { useCallback } from 'react';
import { generatePath } from 'react-router-dom';

import { getLocalePath } from '../../utils/path';
import { useLocale } from '../useLocale';

export const useGenerateLocalePath = () => {
  const lang = useLocale();

  return useCallback(
    (path: string, params: Record<string, string | number> = {}) =>
      generatePath(getLocalePath(path), { ...params, lang }),
    [lang]
  );
};
