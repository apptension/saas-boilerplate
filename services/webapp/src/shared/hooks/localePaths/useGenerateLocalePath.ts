import { generatePath } from 'react-router-dom';
import { useLocale } from '../useLocale';
import { getLocalePath } from '../../utils/path';

export const useGenerateLocalePath = () => {
  const lang = useLocale();

  return (path: string, params: Record<string, string | number> = {}) =>
    generatePath(getLocalePath(path), { ...params, lang })
};
