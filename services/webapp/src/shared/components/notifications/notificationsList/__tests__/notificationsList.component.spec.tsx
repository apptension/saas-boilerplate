import { screen } from '@testing-library/react';
import { times } from 'ramda';
import { makeContextRenderer } from '../../../../utils/testUtils';
import { NotificationsList, NotificationsListProps } from '../notificationsList.component';
import { generateRelayEnvironmentNotifications } from '../notificationsList.fixtures';
import { notificationFactory } from "../../../../../mocks/factories";

describe('NotificationsList: Component', () => {
  const component = (props: Partial<NotificationsListProps>) => (
    <NotificationsList isOpen listQueryRef={{} as any} {...props} />
  );
  const render = makeContextRenderer(component);

  it('should render no items correctly', () => {
    const env = generateRelayEnvironmentNotifications([]);
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

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('should not render non registered notifications', () => {
    const env = generateRelayEnvironmentNotifications([
      {
        type: 'some_random_type_that_doesnt_exist',
      },
    ]);
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

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('should render correct notifications', () => {
    const notifications = times(() => notificationFactory(), 3);
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

    expect(screen.getAllByRole('link')).toHaveLength(notifications.length);
  });
});
