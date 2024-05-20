import { PropsWithChildren } from 'react';

export const CURRENT_TENANT_STORAGE_KEY = 'currentTenant';

export type CurrentTenantProviderProps = {
  storageKey?: string;
} & PropsWithChildren;

export type CurrentTenantStorageState = {
  [key: string]: string;
};
