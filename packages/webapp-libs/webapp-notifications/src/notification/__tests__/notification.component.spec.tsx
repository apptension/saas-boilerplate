import { fireEvent, screen } from '@testing-library/react';

import { PLACEHOLDER_CONTENT, PLACEHOLDER_TEST_ID, render } from '../../tests/utils/rendering';
import { Notification, NotificationProps } from '../notification.component';
import { mockedNotificationProps } from '../notification.fixtures';

describe('Notification: Component', () => {
  const defaultProps: NotificationProps = {
    ...mockedNotificationProps,
  };

  const Component = (props: Partial<NotificationProps>) => <Notification {...defaultProps} {...props} />;

  it('should render title', async () => {
    render(<Component title={PLACEHOLDER_CONTENT} />);

    expect(await screen.findByTestId(PLACEHOLDER_TEST_ID)).toBeInTheDocument();
  });

  it('should render content', async () => {
    render(<Component>{PLACEHOLDER_CONTENT}</Component>);

    expect(await screen.findByTestId(PLACEHOLDER_TEST_ID)).toBeInTheDocument();
  });

  it('should call onClick', async () => {
    const onClick = jest.fn();
    render(<Component onClick={onClick} />);

    const buttons = await screen.findAllByRole('button');
    const container = buttons[0]; // The main notification container
    fireEvent.click(container);

    expect(onClick).toBeCalledTimes(1);
  });
});
