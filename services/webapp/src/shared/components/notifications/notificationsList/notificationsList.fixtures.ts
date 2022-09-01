import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { OperationDescriptor } from 'react-relay/hooks';
import { ExtractNodeType } from '../../../utils/graphql';
import { notificationsListContent$data } from '../../../../__generated__/notificationsListContent.graphql';
import { connectionFromArray } from '../../../utils/testUtils';
import NotificationsListQuery from '../../../../__generated__/notificationsListQuery.graphql';
import { fillCommonQueryWithUser } from '../../../utils/commonQuery';

export const generateRelayEnvironmentNotifications = (
  notifications: Array<Partial<ExtractNodeType<notificationsListContent$data['allNotifications']>>>
) => {
  const environment = createMockEnvironment();
  fillCommonQueryWithUser(environment);
  environment.mock.queueOperationResolver((operation: OperationDescriptor) =>
    MockPayloadGenerator.generate(operation, {
      NotificationConnection: () => connectionFromArray(notifications),
    })
  );
  environment.mock.queuePendingOperation(NotificationsListQuery, {});
  return environment;
};
