import { useCallback, useEffect } from 'react';
import graphql from 'babel-plugin-relay/macro';
import { usePaginationFragment } from 'react-relay';
import { isEmpty } from 'ramda';
import { POLLING_INTERVAL } from '../notifications.constants';
import { useSnackbar } from '../../snackbar';
import { usePromiseMutation } from '../../../services/graphqlApi/usePromiseMutation';
import { notificationsListMarkAsReadMutation } from '../../../../__generated__/notificationsListMarkAsReadMutation.graphql';
import { notificationsListQueryResponse } from '../../../../__generated__/notificationsListQuery.graphql';
import { NotificationsListRefetch } from '../../../../__generated__/NotificationsListRefetch.graphql';
import { notificationsListContent$key } from '../../../../__generated__/notificationsListContent.graphql';
import { useMappedConnection } from '../../../hooks/useMappedConnection';
import { NOTIFICATIONS_PER_PAGE } from './notificationsList.constants';

export const useRefetchNotifications = ({
  fetchNotifications,
  isOpen,
}: {
  isOpen: boolean;
  fetchNotifications: () => void;
}) => {
  useEffect(() => {
    let interval: number | null;
    if (isOpen) {
      interval = setInterval(() => {
        fetchNotifications();
      }, POLLING_INTERVAL);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [fetchNotifications, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);
};

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
      },
    });
    snackbar.showMessage(message);
  };
};

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
  const { data, refetch } = fragment;

  const allNotifications = useMappedConnection(data.allNotifications);

  const fetchNotifications = useCallback(() => {
    refetch(
      {
        count: isEmpty(allNotifications) ? NOTIFICATIONS_PER_PAGE : allNotifications.length,
      },
      { fetchPolicy: 'store-and-network' }
    );
  }, [allNotifications, refetch]);

  return { ...fragment, allNotifications, fetchNotifications };
};
