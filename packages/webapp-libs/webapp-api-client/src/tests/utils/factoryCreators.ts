import { DeepPartial } from '@sb/webapp-core/utils/types';
import { mergeDeepRight } from 'ramda';

export const createFactory =
  <T>(creator: () => T) =>
  (overrides?: Partial<T>) => ({
    ...creator(),
    ...overrides,
  });

export const createDeepFactory =
  <T>(creator: () => T) =>
  (overrides: DeepPartial<T> = {}) =>
    mergeDeepRight<any, any>(creator(), overrides) as T;
