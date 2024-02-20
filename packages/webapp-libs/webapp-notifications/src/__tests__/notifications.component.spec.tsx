import { fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ElementType } from 'react';

import { Notifications } from '../notifications.component';
import { NotificationTypes } from '../notifications.types';
import { fillNotificationCreatedSubscriptionQuery, notificationFactory } from '../tests/factories';
import { render } from '../tests/utils/rendering';

describe('Notifications: Component', () => {
  const templates: Record<NotificationTypes, ElementType> = {
    [NotificationTypes.CRUD_ITEM_CREATED]: () => <>CRUD_ITEM_CREATED</>,
    [NotificationTypes.CRUD_ITEM_UPDATED]: () => <>CRUD_ITEM_UPDATED</>,
  };

  const Component = () => <Notifications templates={templates} />;

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
});
