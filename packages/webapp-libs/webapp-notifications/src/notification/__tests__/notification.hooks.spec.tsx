import { fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { notificationMutation } from '../notification.graphql';
import { useToggleIsRead } from '../notification.hooks';
import { render, renderHook } from '../../tests/utils/rendering';

const TestToggleIsReadComponent = ({
  input,
}: {
  input: { id: string; isRead: boolean };
}) => {
  const toggleIsRead = useToggleIsRead(input);
  return (
    <button onClick={(e) => toggleIsRead(e)} data-testid="toggle-button">
      Toggle
    </button>
  );
};

describe('notification.hooks', () => {
  describe('useToggleIsRead', () => {
    it('should call mutation with correct input when invoked', async () => {
      const notificationId = 'test-notification-id';
      const mutationMock = composeMockedQueryResult(notificationMutation, {
        variables: { input: { id: notificationId, isRead: true } },
        data: {
          updateNotification: {
            hasUnreadNotifications: false,
            unreadNotificationsCount: 0,
            notificationEdge: {
              node: { id: notificationId, readAt: new Date().toISOString() },
            },
          },
        },
      });

      const { waitForApolloMocks } = render(
        <TestToggleIsReadComponent input={{ id: notificationId, isRead: true }} />,
        {
          apolloMocks: [fillCommonQueryWithUser(), mutationMock],
        }
      );

      await userEvent.click(await screen.findByTestId('toggle-button'));
      await waitForApolloMocks();

      expect(mutationMock.result).toHaveBeenCalled();
    });

    it('should stop propagation when event is passed', async () => {
      const notificationId = 'test-id';
      const mutationMock = composeMockedQueryResult(notificationMutation, {
        variables: { input: { id: notificationId, isRead: false } },
        data: {
          updateNotification: {
            hasUnreadNotifications: true,
            unreadNotificationsCount: 1,
            notificationEdge: {
              node: { id: notificationId, readAt: null },
            },
          },
        },
      });

      const parentClick = jest.fn();
      const { waitForApolloMocks } = render(
        <div onClick={parentClick}>
          <TestToggleIsReadComponent input={{ id: notificationId, isRead: false }} />
        </div>,
        { apolloMocks: [fillCommonQueryWithUser(), mutationMock] }
      );

      const button = await screen.findByTestId('toggle-button');
      fireEvent.click(button);
      await waitForApolloMocks();

      expect(mutationMock.result).toHaveBeenCalled();
      expect(parentClick).not.toHaveBeenCalled();
    });

    it('should return a function that can be invoked without event', async () => {
      const notificationId = 'test-id';
      const mutationMock = composeMockedQueryResult(notificationMutation, {
        variables: { input: { id: notificationId, isRead: true } },
        data: {
          updateNotification: {
            hasUnreadNotifications: false,
            unreadNotificationsCount: 0,
            notificationEdge: {
              node: { id: notificationId, readAt: new Date().toISOString() },
            },
          },
        },
      });

      const { result, waitForApolloMocks } = renderHook(
        () => useToggleIsRead({ id: notificationId, isRead: true }),
        { apolloMocks: [fillCommonQueryWithUser(), mutationMock] }
      );

      await waitFor(() => {
        expect(typeof result.current).toBe('function');
      });
      await act(async () => {
        await result.current();
      });
      await waitForApolloMocks();

      expect(mutationMock.result).toHaveBeenCalled();
    });
  });
});
