import { useQuery } from '@apollo/client';
import { NotificationType } from '@sb/webapp-api-client/graphql';
import { notificationFactory } from '@sb/webapp-api-client/tests/factories';
import { screen } from '@testing-library/react';
import { times } from 'ramda';

import { fillCommonQueryWithUser, fillNotificationsListQuery } from '../../../../../tests/factories';
import { render } from '../../../../../tests/utils/rendering';
import { notificationsListQuery } from '../../notifications.graphql';
import { NotificationsList, NotificationsListProps } from '../notificationsList.component';

describe('NotificationsList: Component', () => {
  const Component = (props: Partial<NotificationsListProps>) => {
    const { loading, data } = useQuery(notificationsListQuery);
    return <NotificationsList isOpen onLoadMore={() => null} loading={loading} queryResult={data} {...props} />;
  };

  const renderWithNotifications = (
    notifications: Array<Partial<NotificationType>>,
    additionalData?: Record<string, any>
  ) => {
    const mockRequest = fillNotificationsListQuery(notifications, additionalData);

    const apolloMocks = [fillCommonQueryWithUser(), mockRequest];

    return render(<Component />, { apolloMocks });
  };

  it('should render no items correctly', async () => {
    const { waitForApolloMocks } = renderWithNotifications([], { hasUnreadNotifications: false });
    await waitForApolloMocks(0);

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
    const { waitForApolloMocks } = renderWithNotifications(notifications, { hasUnreadNotifications: false });

    await waitForApolloMocks(0);

    expect(screen.getAllByLabelText('Loading notification')).toHaveLength(2);
    expect(await screen.findByText('Mark all as read')).toBeInTheDocument();
    expect(await screen.findAllByRole('link')).toHaveLength(notifications.length);
  });

  it('should not render wrong notifications', async () => {
    const correctNotifications = times(() => notificationFactory(), 3);
    const malformedNotification = notificationFactory({
      data: null,
    });
    renderWithNotifications([...correctNotifications, malformedNotification], { hasUnreadNotifications: false });

    expect(await screen.findAllByRole('link')).toHaveLength(correctNotifications.length);
  });
});
