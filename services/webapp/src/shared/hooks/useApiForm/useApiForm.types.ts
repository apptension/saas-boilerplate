import { UseFormOptions } from 'react-hook-form/dist/types';
import { ErrorMessages } from './useTranslatedErrors/useTranslatedErrors.types';

export type UseApiFormArgs<FormData extends Record<string, any>> = UseFormOptions<FormData> & {
  errorMessages?: ErrorMessages;
};
