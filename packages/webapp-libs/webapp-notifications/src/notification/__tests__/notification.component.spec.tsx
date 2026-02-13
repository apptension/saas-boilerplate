import { fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { fireEvent, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { notificationMutation } from '../notification.graphql';
import { PLACEHOLDER_CONTENT, PLACEHOLDER_TEST_ID, render } from '../../tests/utils/rendering';
import { Notification, NotificationProps } from '../notification.component';
import { mockedNotificationProps } from '../notification.fixtures';

describe('Notification: Component', () => {
  const defaultProps: NotificationProps = {
    ...mockedNotificationProps,
  };

  const Component = (props: Partial<NotificationProps>) => <Notification {...defaultProps} {...props} />;

  it('should render title', async () => {
    render(<Component title={PLACEHOLDER_CONTENT} />);

    expect(await screen.findByTestId(PLACEHOLDER_TEST_ID)).toBeInTheDocument();
  });

  it('should render content', async () => {
    render(<Component>{PLACEHOLDER_CONTENT}</Component>);

    expect(await screen.findByTestId(PLACEHOLDER_TEST_ID)).toBeInTheDocument();
  });

  it('should call onClick', async () => {
    const onClick = jest.fn();
    render(<Component onClick={onClick} />);

    const buttons = await screen.findAllByRole('button');
    const container = buttons[0];
    fireEvent.click(container);

    expect(onClick).toBeCalledTimes(1);
  });

  it('should show mark as read button for unread notification', async () => {
    render(<Component readAt={null} />);

    expect(await screen.findByLabelText(/mark as read/i)).toBeInTheDocument();
  });

  it('should show mark as unread button for read notification', async () => {
    render(<Component readAt={new Date().toISOString()} />);

    expect(await screen.findByLabelText(/mark as unread/i)).toBeInTheDocument();
  });

  it('should call mutation when mark as read is clicked', async () => {
    const notificationId = 'test-notification-id-123';
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

    const { waitForApolloMocks } = render(<Component id={notificationId} readAt={null} />, {
      apolloMocks: [fillCommonQueryWithUser(), mutationMock],
    });

    await userEvent.click(await screen.findByLabelText(/mark as read/i));
    await waitForApolloMocks(1);
    expect(mutationMock.result).toHaveBeenCalled();
  });

  it('should render with icon when no avatar', async () => {
    render(<Component avatar={null} />);

    expect(await screen.findByText('Lorem ipsum sit dolor amet')).toBeInTheDocument();
  });
});
