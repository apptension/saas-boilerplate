import { reportError } from '@sb/webapp-core/utils/reportError';

import { CURRENT_TENANT_STORAGE_KEY } from './currentTenantProvider.types';

export const setCurrentTenantStorageState = (tenantId: string) => {
  try {
    localStorage.setItem(CURRENT_TENANT_STORAGE_KEY, tenantId);
    // On localStorage.setItem, the storage event is only triggered on other tabs and windows.
    // So we manually dispatch a storage event to trigger the subscribe function on the current window as well.
    window.dispatchEvent(new StorageEvent('storage', { key: CURRENT_TENANT_STORAGE_KEY, newValue: tenantId }));
  } catch (e) {
    reportError(e);
  }
};

export const store = {
  getSnapshot: () => localStorage.getItem(CURRENT_TENANT_STORAGE_KEY),
  subscribe: (listener: () => void) => {
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  },
};
