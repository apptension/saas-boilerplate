import { reportError } from '@sb/webapp-core/utils/reportError';

import { CURRENT_TENANT_STORAGE_KEY, CurrentTenantStorageState } from './currentTenantProvider.types';

export const setCurrentTenantStorageState = (storageState: CurrentTenantStorageState) => {
  try {
    const newValue = JSON.stringify(storageState);
    localStorage.setItem(CURRENT_TENANT_STORAGE_KEY, newValue);
    // On localStorage.setItem, the storage event is only triggered on other tabs and windows.
    // So we manually dispatch a storage event to trigger the subscribe function on the current window as well.
    window.dispatchEvent(new StorageEvent('storage', { key: CURRENT_TENANT_STORAGE_KEY, newValue }));
  } catch (e) {
    reportError(e);
  }
};

export const store = {
  getSnapshot: () => localStorage.getItem(CURRENT_TENANT_STORAGE_KEY) ?? '{}',
  subscribe: (listener: () => void) => {
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  },
};
