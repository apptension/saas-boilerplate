import { createMockEnvironment } from 'relay-test-utils';
import { commitLocalUpdate, RecordSourceSelectorProxy } from 'relay-runtime';

export const relayEnvironment = createMockEnvironment();

export const invalidateRelayStore = () => {
  commitLocalUpdate(relayEnvironment, (store) => {
    (store as RecordSourceSelectorProxy).invalidateStore();
  });
};
