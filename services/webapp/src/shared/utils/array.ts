import { ArrayOrSingle } from './types';

export const alwaysArray = <T>(value: ArrayOrSingle<T>) => (Array.isArray(value) ? value : [value]);
