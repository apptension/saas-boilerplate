import { screen } from '@testing-library/react';
import { times } from 'ramda';
import { makeContextRenderer } from '../../../../utils/testUtils';
import { NotificationsList, NotificationsListProps } from '../notificationsList.component';
import { generateRelayEnvironmentNotifications } from '../notificationsList.fixtures';
import { notificationFactory } from '../../../../../mocks/factories';
import { ExtractNodeType } from '../../../../utils/graphql';
import { notificationsListContent } from '../../../../../__generated__/notificationsListContent.graphql';

describe('NotificationsList: Component', () => {
  const component = (props: Partial<NotificationsListProps>) => (
    <NotificationsList isOpen listQueryRef={{} as any} {...props} />
  );
  const render = makeContextRenderer(component);

  const renderWithNotifications = (
    notifications: Array<Partial<ExtractNodeType<notificationsListContent['allNotifications']>>>
  ) => {
    const env = generateRelayEnvironmentNotifications(notifications);
    render(
      {
        listQueryRef: {
          environment: env,
          isDisposed: false,
        } as any,
      },
      {
        relayEnvironment: env,
      }
    );
  };

  it('should render no items correctly', () => {
    renderWithNotifications([]);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('should not render non registered notifications', () => {
    renderWithNotifications([
      {
        type: 'some_random_type_that_doesnt_exist',
      },
    ]);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('should render correct notifications', () => {
    const notifications = times(() => notificationFactory(), 3);
    renderWithNotifications(notifications);

    expect(screen.getAllByRole('link')).toHaveLength(notifications.length);
  });

  it('should not render wrong notifications', () => {
    const correctNotifications = times(() => notificationFactory(), 3);
    const malformedNotification = notificationFactory({
      data: null,
    });
    renderWithNotifications([...correctNotifications, malformedNotification]);

    expect(screen.getAllByRole('link')).toHaveLength(correctNotifications.length);
  });
});
