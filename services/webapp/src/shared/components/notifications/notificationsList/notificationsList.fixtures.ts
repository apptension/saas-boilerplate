import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { OperationDescriptor } from 'react-relay/hooks';
import { ExtractNodeType } from '../../../utils/graphql';
import { notificationsListContent } from '../../../../__generated__/notificationsListContent.graphql';
import { connectionFromArray } from '../../../utils/testUtils';
import NotificationsListQuery from '../../../../__generated__/notificationsListQuery.graphql';

export const generateRelayEnvironmentNotifications = (
  notifications: Array<Partial<ExtractNodeType<notificationsListContent['allNotifications']>>>
) => {
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation: OperationDescriptor) =>
    MockPayloadGenerator.generate(operation, {
      NotificationConnection: () => connectionFromArray(notifications),
    })
  );
  environment.mock.queuePendingOperation(NotificationsListQuery, {});
  return environment;
};
