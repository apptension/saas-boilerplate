import { screen } from '@testing-library/react';
import { times } from 'ramda';
import { useQuery } from '@apollo/client';
import { render } from '../../../../../tests/utils/rendering';
import { NotificationsList, NotificationsListProps } from '../notificationsList.component';
import { fillNotificationsListQuery, notificationFactory } from '../../../../../mocks/factories';
import { ExtractNodeType } from '../../../../utils/graphql';
import { notificationsListContent$data } from '../__generated__/notificationsListContent.graphql';
import { getRelayEnv } from '../../../../../tests/utils/relay';
import { NOTIFICATIONS_LIST_QUERY } from '../../notifications.graphql';

describe('NotificationsList: Component', () => {
  const Component = (props: Partial<NotificationsListProps>) => {
    const { loading, data } = useQuery(NOTIFICATIONS_LIST_QUERY);
    return <NotificationsList isOpen onLoadMore={() => null} loading={loading} queryResult={data} {...props} />;
  };

  const renderWithNotifications = (
    notifications: Array<Partial<ExtractNodeType<notificationsListContent$data['allNotifications']>>>
  ) => {
    const env = getRelayEnv();
    const mockRequest = fillNotificationsListQuery(env, notifications);

    if (mockRequest.result?.data) {
      mockRequest.result.data.hasUnreadNotifications = false;
    }
    const apolloMocks = [mockRequest];

    render(<Component />, { relayEnvironment: env, apolloMocks });
  };

  it('should render no items correctly', async () => {
    renderWithNotifications([]);

    expect(screen.getAllByLabelText('Loading notification')).toHaveLength(2);
    expect(await screen.findByText('Mark all as read')).toBeInTheDocument();
    expect(await screen.findByText('No notifications')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('should not render non registered notifications', async () => {
    renderWithNotifications([
      notificationFactory({
        type: 'some_random_type_that_doesnt_exist',
      }),
    ]);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('should render correct notifications', async () => {
    const notifications = times(() => notificationFactory(), 3);
    renderWithNotifications(notifications);

    expect(screen.getAllByLabelText('Loading notification')).toHaveLength(2);
    expect(await screen.findByText('Mark all as read')).toBeInTheDocument();
    expect(await screen.findAllByRole('link')).toHaveLength(notifications.length);
  });

  it('should not render wrong notifications', async () => {
    const correctNotifications = times(() => notificationFactory(), 3);
    const malformedNotification = notificationFactory({
      data: null,
    });
    renderWithNotifications([...correctNotifications, malformedNotification]);

    expect(await screen.findAllByRole('link')).toHaveLength(correctNotifications.length);
  });
});
