import { useMutation } from '@apollo/client';
import { useMappedConnection } from '../../../hooks/useMappedConnection';
import { useSnackbar } from '../../../../modules/snackbar';
import { FragmentType, useFragment } from '../../../services/graphqlApi/__generated/gql';
import { notificationsListContentFragment, notificationsListMarkAsReadMutation } from './notificationsList.graphql';

export const useMarkAllAsRead = (message: string) => {
  const snackbar = useSnackbar();

  const [commitMarkAsReadMutation] = useMutation(notificationsListMarkAsReadMutation);

  return async () => {
    await commitMarkAsReadMutation({
      variables: {
        input: {},
      },
      update(cache, { data }) {
        cache.modify({
          fields: {
            hasUnreadNotifications() {
              return false;
            },
            allNotifications(connection = { edges: [] }) {
              const readAt = new Date().toISOString();
              connection.edges.forEach((edge) => {
                cache.modify({
                  id: edge.node.__ref,
                  fields: {
                    readAt() {
                      return readAt;
                    },
                  },
                });
              });
              return connection;
            },
          },
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
