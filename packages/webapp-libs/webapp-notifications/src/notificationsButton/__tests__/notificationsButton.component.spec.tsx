import { useQuery } from '@apollo/client/react';
import { screen } from '@testing-library/react';
import { append } from 'ramda';

import { notificationsListQuery } from '../../notifications.graphql';
import { fillNotificationsListQuery } from '../../tests/factories';
import { render } from '../../tests/utils/rendering';
import { NotificationsButton, NotificationsButtonProps } from '../notificationsButton.component';

describe('NotificationsButton: Component', () => {
  const defaultProps: Omit<NotificationsButtonProps, 'listQueryRef'> = {};

  const Component = (props: Partial<NotificationsButtonProps>) => {
    const { data } = useQuery(notificationsListQuery);
    return <NotificationsButton queryResult={data} {...defaultProps} {...props} />;
  };

  it('should render without errors', async () => {
    const { waitForApolloMocks } = render(<Component />, {
      apolloMocks: append(fillNotificationsListQuery([], { hasUnreadNotifications: false })),
    });

    await waitForApolloMocks();

    expect(await screen.findByRole('button')).toBeInTheDocument();
  });

  it('should show unread count badge', async () => {
    const { waitForApolloMocks } = render(<Component />, {
      apolloMocks: append(
        fillNotificationsListQuery([], { hasUnreadNotifications: true, unreadNotificationsCount: 5 })
      ),
    });

    await waitForApolloMocks();

    expect(await screen.findByText('5')).toBeInTheDocument();
  });

  it('should show 99+ when count exceeds 99', async () => {
    const { waitForApolloMocks } = render(<Component />, {
      apolloMocks: append(
        fillNotificationsListQuery([], { hasUnreadNotifications: true, unreadNotificationsCount: 150 })
      ),
    });

    await waitForApolloMocks();

    expect(await screen.findByText('99+')).toBeInTheDocument();
  });
});
