import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { OperationDescriptor } from 'react-relay/hooks';
import { screen } from '@testing-library/react';
import { NotificationsButton, NotificationsButtonProps } from '../notificationsButton.component';
import { render } from '../../../../../tests/utils/rendering';
import notificationsListQueryGraphql from '../../__generated__/notificationsListQuery.graphql';
import { fillCommonQueryWithUser } from '../../../../utils/commonQuery';

describe('NotificationsButton: Component', () => {
  const defaultProps: Omit<NotificationsButtonProps, 'listQueryRef'> = {};

  const Component = (props: Partial<NotificationsButtonProps>) => (
    <NotificationsButton listQueryRef={{} as any} {...defaultProps} {...props} />
  );

  it('should render without errors', () => {
    const environment = createMockEnvironment();
    fillCommonQueryWithUser(environment);
    environment.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        hasUnreadNotifications: () => false,
      })
    );
    environment.mock.queuePendingOperation(notificationsListQueryGraphql, {});

    render(
      <Component
        listQueryRef={
          {
            environment,
            isDisposed: false,
          } as any
        }
      />,
      { relayEnvironment: environment }
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
