import { useQuery } from '@apollo/client';
import { NotificationType } from '@sb/webapp-api-client';
import { fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { times } from 'ramda';



import { NotificationTypes } from '../../';
import { notificationsListQuery } from '../../notifications.graphql';
import { fillNotificationsListQuery, notificationFactory } from '../../tests/factories';
import { render } from '../../tests/utils/rendering';
import { NotificationsList, NotificationsListProps } from '../notificationsList.component';
import { notificationsListMarkAsReadMutation } from '../notificationsList.graphql';


const NotificationMock = ({ type }: NotificationType) => {
  return <span>notification-mock: {type}</span>;
};

describe('NotificationsList: Component', () => {
  const Component = (props: Partial<NotificationsListProps>) => {
    const { loading, data } = useQuery(notificationsListQuery);
    return (
      <NotificationsList
        templates={{
          [NotificationTypes.CRUD_ITEM_CREATED]: NotificationMock,
          [NotificationTypes.CRUD_ITEM_UPDATED]: NotificationMock,
          [NotificationTypes.TENANT_INVITATION_CREATED]: NotificationMock,
          [NotificationTypes.TENANT_INVITATION_ACCEPTED]: NotificationMock,
          [NotificationTypes.TENANT_INVITATION_DECLINED]: NotificationMock,
        }}
        onLoadMore={() => null}
        loading={loading}
        queryResult={data}
        {...props}
      />
    );
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

    expect(await screen.findByText('Mark all as read')).toBeInTheDocument();
    expect(await screen.findByText('No notifications')).toBeInTheDocument();
    expect(screen.queryAllByText(/notification-mock/i)).toHaveLength(0);
  });

  it('should not render non registered notifications', async () => {
    renderWithNotifications([
      notificationFactory({
        type: 'some_random_type_that_doesnt_exist',
      }),
    ]);

    expect(screen.queryAllByText(/notification-mock/i)).toHaveLength(0);
  });

  it('should render correct notifications', async () => {
    const notifications = times(() => notificationFactory(), 3);
    const { waitForApolloMocks } = renderWithNotifications(notifications, { hasUnreadNotifications: false });

    await waitForApolloMocks(0);

    const t = await screen.findByText('Mark all as read');
    expect(t).toBeInTheDocument();
    expect(await screen.findAllByText(/notification-mock/i)).toHaveLength(notifications.length);
  });

  it('should not render wrong notifications', async () => {
    const correctNotifications = times(() => notificationFactory(), 3);
    const malformedNotification = notificationFactory({
      type: "malformed-notification",
    });
    renderWithNotifications([...correctNotifications, malformedNotification], { hasUnreadNotifications: false });

    expect(await screen.findAllByText(/notification-mock/i)).toHaveLength(correctNotifications.length);
  });

  it('should render toast after click Mark all as read button', async () => {
    const mutationMock = composeMockedQueryResult(notificationsListMarkAsReadMutation, {
      data: { markReadAllNotifications: { ok: true } },
      variables: {
        input: {},
      },
    });

    const { waitForApolloMocks } = render(<Component />, {
      apolloMocks: (defaultMocks) => defaultMocks.concat(mutationMock),
    });

    await waitForApolloMocks(0);
    await userEvent.click(await screen.findByText('Mark all as read'));
    await waitForApolloMocks();

    expect(await screen.findByText('All notifications marked as read.')).toBeInTheDocument();
    expect(await screen.findByText('No notifications')).toBeInTheDocument();
  });
});