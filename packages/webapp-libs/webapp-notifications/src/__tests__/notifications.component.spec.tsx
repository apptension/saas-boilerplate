import { fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ElementType } from 'react';

import { Notifications, NotificationsProps } from '../notifications.component';
import { NotificationTypes } from '../notifications.types';
import {
  fillNotificationCreatedSubscriptionQuery,
  fillNotificationsListQuery,
  notificationFactory,
} from '../tests/factories';
import { render } from '../tests/utils/rendering';

describe('Notifications: Component', () => {
  const templates: Record<NotificationTypes, ElementType> = {
    [NotificationTypes.CRUD_ITEM_CREATED]: () => <>CRUD_ITEM_CREATED</>,
    [NotificationTypes.CRUD_ITEM_UPDATED]: () => <>CRUD_ITEM_UPDATED</>,
    [NotificationTypes.TENANT_INVITATION_CREATED]: () => <>TENANT_INVITATION_CREATED</>,
    [NotificationTypes.TENANT_INVITATION_ACCEPTED]: () => <>TENANT_INVITATION_ACCEPTED</>,
    [NotificationTypes.TENANT_INVITATION_DECLINED]: () => <>TENANT_INVITATION_DECLINED</>,
  };

  const Component = ({ events = {} }: { events?: NotificationsProps['events'] }) => (
    <Notifications templates={templates} events={events} />
  );

  it('Should show trigger button', async () => {
    const apolloMocks = [
      fillCommonQueryWithUser(),
      fillNotificationCreatedSubscriptionQuery(
        notificationFactory({
          type: 'some_random_type_that_doesnt_exist',
        })
      ),
    ];

    const { waitForApolloMocks } = render(<Component />, { apolloMocks });
    await waitForApolloMocks();

    expect(await screen.findByLabelText('Open notifications')).toBeInTheDocument();
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });

  it('Should open notifications center', async () => {
    render(<Component />);

    await userEvent.click(await screen.findByTestId('notifications-trigger-testid'));
    expect(await screen.findByText('Notifications')).toBeInTheDocument();
  });

  it('Should call notification event for proper type', async () => {
    const notificationType = NotificationTypes.TENANT_INVITATION_CREATED;

    const apolloMocks = [
      fillCommonQueryWithUser(),
      fillNotificationCreatedSubscriptionQuery(
        notificationFactory({
          type: notificationType,
        })
      ),
    ];

    const mockEvent = jest.fn();
    const events = { [notificationType]: mockEvent };

    const { waitForApolloMocks } = render(<Component events={events} />, { apolloMocks });
    await waitForApolloMocks();

    expect(mockEvent).toHaveBeenCalled();
  });

  it('Should ignore existing notification from Subscription', async () => {
    const notification = notificationFactory({
      type: NotificationTypes.TENANT_INVITATION_ACCEPTED,
    });

    const apolloMocks = [
      fillCommonQueryWithUser(),
      fillNotificationsListQuery([notification]),
      fillNotificationCreatedSubscriptionQuery(notification),
    ];

    const { waitForApolloMocks } = render(<Component />, { apolloMocks });
    await waitForApolloMocks();

    await userEvent.click(await screen.findByTestId('notifications-trigger-testid'));
    expect(await screen.findByText('TENANT_INVITATION_ACCEPTED')).toBeInTheDocument();
  });
});
