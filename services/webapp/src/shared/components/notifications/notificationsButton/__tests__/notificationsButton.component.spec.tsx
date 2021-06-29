import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { OperationDescriptor } from 'react-relay/hooks';
import { screen } from '@testing-library/react';
import { NotificationsButton, NotificationsButtonProps } from '../notificationsButton.component';
import { makeContextRenderer } from '../../../../utils/testUtils';
import NotificationsListQuery from '../../../../../__generated__/notificationsListQuery.graphql';

describe('NotificationsButton: Component', () => {
  const defaultProps: Omit<NotificationsButtonProps, 'listQueryRef'> = {};

  const component = (props: Partial<NotificationsButtonProps>) => (
    <NotificationsButton listQueryRef={{} as any} {...defaultProps} {...props} />
  );
  const render = makeContextRenderer(component);

  it('should render without errors', () => {
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        hasUnreadNotifications: () => false,
      })
    );
    environment.mock.queuePendingOperation(NotificationsListQuery, {});

    render(
      {
        listQueryRef: {
          environment,
          isDisposed: false,
        } as any,
      },
      { relayEnvironment: environment }
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
