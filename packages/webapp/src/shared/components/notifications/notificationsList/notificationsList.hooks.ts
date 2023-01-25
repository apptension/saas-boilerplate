import graphql from 'babel-plugin-relay/macro';
import { ConnectionHandler } from 'react-relay';
import { usePromiseMutation } from '../../../services/graphqlApi/usePromiseMutation';
import { useMappedConnection } from '../../../hooks/useMappedConnection';
import { useSnackbar } from '../../../../modules/snackbar';
import { FragmentType, useFragment } from '../../../services/graphqlApi/__generated/gql';
import { notificationsListMarkAsReadMutation } from './__generated__/notificationsListMarkAsReadMutation.graphql';
import { notificationsListContentFragment } from './notificationsList.graphql';

export const useMarkAllAsRead = (message: string) => {
  const snackbar = useSnackbar();

  const [commitMarkAsReadMutation] = usePromiseMutation<notificationsListMarkAsReadMutation>(graphql`
    mutation notificationsListMarkAsReadMutation($input: MarkReadAllNotificationsMutationInput!) {
      markReadAllNotifications(input: $input) {
        ok
      }
    }
  `);

  return async () => {
    await commitMarkAsReadMutation({
      variables: {
        input: {},
      },
      updater: (store) => {
        store.getRoot().setValue(false, 'hasUnreadNotifications');

        const readAt = new Date().toISOString();
        ConnectionHandler.getConnection(store.getRoot(), 'notificationsList_allNotifications')
          ?.getLinkedRecords('edges')
          ?.forEach((edge) => {
            const notification = edge.getLinkedRecord('node');
            notification?.setValue(readAt, 'readAt');
          });
      },
    });
    snackbar.showMessage(message);
  };
};

// const subscription = graphql`
//   subscription notificationsListSubscription($connections: [ID!]!) {
//     notificationCreated {
//       edges @prependEdge(connections: $connections) {
//         node {
//           id
//           type
//           createdAt
//           readAt
//           data
//         }
//       }
//     }
//   }
// `;

export const useNotificationsListContent = (queryResult?: FragmentType<typeof notificationsListContentFragment>) => {
  const data = useFragment(notificationsListContentFragment, queryResult);

  const allNotifications = useMappedConnection(data?.allNotifications);

  // todo: update hasUnreadNotifications in store
  // useSubscription<notificationsListSubscription>(
  //   useMemo(
  //     () => ({
  //       variables: {
  //         connections: [ConnectionHandler.getConnectionID('root', 'notificationsList_allNotifications')],
  //       },
  //       subscription,
  //       updater: (store) => {
  //         store.getRoot().setValue(true, 'hasUnreadNotifications');
  //       },
  //     }),
  //     []
  //   )
  // );

  return {
    allNotifications,
    hasNext: data?.allNotifications?.pageInfo.hasNextPage || false,
    endCursor: data?.allNotifications?.pageInfo.endCursor,
  };
};
