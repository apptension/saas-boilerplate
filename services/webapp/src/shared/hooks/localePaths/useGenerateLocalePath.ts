import { generatePath } from 'react-router-dom';
import { useLocale } from '../useLocale';

export const useGenerateLocalePath = () => {
  const lang = useLocale();

  return (path: string, params: Record<string, string | number> = {}) => generatePath(path, { ...params, lang });
};
