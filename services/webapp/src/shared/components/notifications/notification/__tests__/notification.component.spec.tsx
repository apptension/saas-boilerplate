import { fireEvent, screen } from '@testing-library/react';
import { Notification, NotificationProps } from '../notification.component';
import { render, PLACEHOLDER_CONTENT, PLACEHOLDER_TEST_ID } from '../../../../../tests/utils/rendering';
import { mockedNotificationProps } from '../notification.fixtures';

describe('Notification: Component', () => {
  const defaultProps: NotificationProps = {
    ...mockedNotificationProps,
  };

  const Component = (props: Partial<NotificationProps>) => <Notification {...defaultProps} {...props} />;

  it('should render title', () => {
    render(<Component title={PLACEHOLDER_CONTENT} />);

    expect(screen.getByTestId(PLACEHOLDER_TEST_ID)).toBeInTheDocument();
  });

  it('should render content', () => {
    render(<Component>{PLACEHOLDER_CONTENT}</Component>);

    expect(screen.getByTestId(PLACEHOLDER_TEST_ID)).toBeInTheDocument();
  });

  it('should call onClick', () => {
    const onClick = jest.fn();
    render(<Component onClick={onClick} />);

    const container = screen.getByRole('link');
    fireEvent.click(container);

    expect(onClick).toBeCalledTimes(1);
  });
});
