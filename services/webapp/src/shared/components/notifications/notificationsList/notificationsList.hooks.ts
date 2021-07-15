import graphql from 'babel-plugin-relay/macro';
import { ConnectionHandler, usePaginationFragment, useSubscription } from 'react-relay';
import { useMemo } from 'react';
import { useSnackbar } from '../../snackbar';
import { usePromiseMutation } from '../../../services/graphqlApi/usePromiseMutation';
import { notificationsListMarkAsReadMutation } from '../../../../__generated__/notificationsListMarkAsReadMutation.graphql';
import { notificationsListQueryResponse } from '../../../../__generated__/notificationsListQuery.graphql';
import { NotificationsListRefetch } from '../../../../__generated__/NotificationsListRefetch.graphql';
import { notificationsListContent$key } from '../../../../__generated__/notificationsListContent.graphql';
import { useMappedConnection } from '../../../hooks/useMappedConnection';
import { notificationsListSubscription } from '../../../../__generated__/notificationsListSubscription.graphql';

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

const subscription = graphql`
  subscription notificationsListSubscription($connections: [ID!]!) {
    notificationCreated {
      edges @prependEdge(connections: $connections) {
        node {
          id
          type
          createdAt
          readAt
          data
        }
      }
    }
  }
`;

export const useNotificationsListContent = (queryResponse: notificationsListQueryResponse) => {
  const fragment = usePaginationFragment<NotificationsListRefetch, notificationsListContent$key>(
    graphql`
      fragment notificationsListContent on ApiQuery
      @refetchable(queryName: "NotificationsListRefetch")
      @argumentDefinitions(count: { type: "Int", defaultValue: 20 }, cursor: { type: "String" }) {
        hasUnreadNotifications
        allNotifications(first: $count, after: $cursor) @connection(key: "notificationsList_allNotifications") {
          edges {
            node {
              id
              data
              createdAt
              readAt
              type
            }
          }
        }
      }
    `,
    queryResponse
  );

  const allNotifications = useMappedConnection(fragment.data.allNotifications);

  useSubscription<notificationsListSubscription>(
    useMemo(
      () => ({
        variables: {
          connections: [ConnectionHandler.getConnectionID('root', 'notificationsList_allNotifications')],
        },
        subscription,
        updater: (store) => {
          store.getRoot().setValue(true, 'hasUnreadNotifications');
        },
      }),
      []
    )
  );

  return { ...fragment, allNotifications };
};
