import { fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { notificationsListMarkAsReadMutation } from '../notificationsList.graphql';
import { useMarkAllAsRead, useNotificationsListContent } from '../notificationsList.hooks';
import { fillNotificationsListQuery, notificationFactory } from '../../tests/factories';
import { render, renderHook } from '../../tests/utils/rendering';

const TestMarkAllAsReadComponent = ({ message }: { message: string }) => {
  const markAllAsRead = useMarkAllAsRead(message);
  return <button onClick={() => markAllAsRead()}>Mark all</button>;
};

describe('notificationsList.hooks', () => {
  describe('useMarkAllAsRead', () => {
    it('should call mutation and show toast on success', async () => {
      const mutationMock = composeMockedQueryResult(notificationsListMarkAsReadMutation, {
        data: {
          markReadAllNotifications: {
            ok: true,
            hasUnreadNotifications: false,
            unreadNotificationsCount: 0,
          },
        },
        variables: { input: {} },
      });

      const apolloMocks = [fillCommonQueryWithUser(), fillNotificationsListQuery([]), mutationMock];
      const { waitForApolloMocks } = render(
        <TestMarkAllAsReadComponent message="All notifications marked as read." />,
        { apolloMocks }
      );

      await waitForApolloMocks(0);
      await userEvent.click(await screen.findByText('Mark all'));
      await waitForApolloMocks();

      expect(mutationMock.result).toHaveBeenCalled();
      expect(await screen.findByText('All notifications marked as read.')).toBeInTheDocument();
    });

    it('should return a function that can be invoked', async () => {
      const { result } = renderHook(() => useMarkAllAsRead('Test message'), {
        apolloMocks: [fillCommonQueryWithUser(), fillNotificationsListQuery([])],
      });

      await waitFor(() => {
        expect(typeof result.current).toBe('function');
      });
    });
  });

  describe('useNotificationsListContent', () => {
    const createFragmentData = (overrides?: {
      edges?: Array<{ node: Record<string, unknown> }>;
      hasNextPage?: boolean;
      endCursor?: string;
    }) => {
      const notifications = overrides?.edges ?? [notificationFactory(), notificationFactory()];
      return {
        hasUnreadNotifications: false,
        allNotifications: {
          edges: notifications.map((n) => ({ node: { __typename: 'NotificationType', ...n } })),
          pageInfo: {
            hasNextPage: overrides?.hasNextPage ?? false,
            endCursor: overrides?.endCursor ?? 'cursor-1',
          },
        },
      };
    };

    it('should return empty list when queryResult is undefined', async () => {
      const { result } = renderHook(() => useNotificationsListContent(undefined), {
        apolloMocks: [fillCommonQueryWithUser()],
      });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });
      expect(result.current.allNotifications).toEqual([]);
      expect(result.current.hasNext).toBe(false);
      expect(result.current.endCursor).toBeUndefined();
    });

    it('should return mapped notifications from fragment data', async () => {
      const fragmentData = createFragmentData();
      const { result } = renderHook(
        () => useNotificationsListContent(fragmentData as any),
        { apolloMocks: [fillCommonQueryWithUser()] }
      );

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });
      expect(result.current.allNotifications).toHaveLength(2);
      expect(result.current.hasNext).toBe(false);
      expect(result.current.endCursor).toBe('cursor-1');
    });

    it('should return hasNext and endCursor when pageInfo has next page', async () => {
      const fragmentData = createFragmentData({ hasNextPage: true, endCursor: 'next-cursor' });
      const { result } = renderHook(
        () => useNotificationsListContent(fragmentData as any),
        { apolloMocks: [fillCommonQueryWithUser()] }
      );

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });
      expect(result.current.hasNext).toBe(true);
      expect(result.current.endCursor).toBe('next-cursor');
    });

    it('should return empty list when allNotifications is null', async () => {
      const fragmentData = { hasUnreadNotifications: false, allNotifications: null };
      const { result } = renderHook(
        () => useNotificationsListContent(fragmentData as any),
        { apolloMocks: [fillCommonQueryWithUser()] }
      );

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });
      expect(result.current.allNotifications).toEqual([]);
    });
  });
});
