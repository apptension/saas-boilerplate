import { ENV } from '@sb/webapp-core/config/env';
import { StatusCodes } from 'http-status-codes';

export const validateStatus = (status: number) => (status >= 200 && status < 300) || status === StatusCodes.BAD_REQUEST;

export type URLParams<T extends string> = Record<T, number | string>;

export type ExtractURLParams<T extends (constiables: any) => string> = Parameters<T>[0];

export const apiURL = (value: string) => ENV.BASE_API_URL + value;

function pathJoin(...args: Array<string>) {
  let parts: Array<string> = [];
  for (let i = 0, l = arguments.length; i < l; i++) {
    parts = parts.concat(args[i].split('/'));
  }
  const newParts = [];
  for (let i = 0, l = parts.length; i < l; i++) {
    const part = parts[i];
    if (!part || part === '.') continue;
    if (part === '..') newParts.pop();
    else {
      // @ts-ignore
      newParts.push(part);
    }
  }
  if (parts[0] === '') {
    // @ts-ignore
    newParts.unshift('');
  }
  return newParts.join('/') || (newParts.length ? '/' : '.');
}

export const apiURLs = <T extends Record<string, string | ((constiables: any) => string)>>(
  root: string,
  nestedRoutes: T
): T => {
  const joinURL = (value: string, baseUrl: string) => {
    const protocolRx = /https?:\/\//;
    if (protocolRx.test(baseUrl)) {
      return new URL(value, baseUrl).href;
    }
    return pathJoin(baseUrl, value);
  };

  const newEntries = Object.entries(nestedRoutes).map(([key, value]) => {
    const prefixedValue =
      typeof value === 'string'
        ? joinURL(pathJoin(root, value), ENV.BASE_API_URL) + '/'
        : (args: any) => joinURL(pathJoin(root, value(args)), ENV.BASE_API_URL) + '/';
    return [key, prefixedValue];
  });
  return Object.fromEntries(newEntries) as T;
};

export const appendId = ({ id }: URLParams<'id'>) => `/${id}`;
