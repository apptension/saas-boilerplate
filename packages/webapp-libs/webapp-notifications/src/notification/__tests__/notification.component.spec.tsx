import { fireEvent, screen } from '@testing-library/react';

import { PLACEHOLDER_CONTENT, PLACEHOLDER_TEST_ID, render } from '../../tests/utils/rendering';
import { Notification, NotificationProps } from '../notification.component';
import { mockedNotificationProps } from '../notification.fixtures';

jest.mock('../notification.hooks', () => ({
  useToggleIsRead: jest.fn(),
}));

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

    const container = await screen.findByRole('link');
    fireEvent.click(container);

    expect(onClick).toBeCalledTimes(1);
  });

  it('should render avatar when provided', async () => {
    const avatar = 'https://example.com/avatar.jpg';
    render(<Component avatar={avatar} />);

    const avatarImg = await screen.findByRole('img');
    expect(avatarImg).toHaveAttribute('src', avatar);
  });

  it('should toggle read status when button is clicked', async () => {
    const { useToggleIsRead } = require('../notification.hooks');
    const onToggleIsRead = jest.fn();
    useToggleIsRead.mockReturnValue(onToggleIsRead);

    render(<Component readAt={null} />);

    const toggleButton = await screen.findByRole('button');
    fireEvent.click(toggleButton);

    expect(onToggleIsRead).toBeCalledTimes(1);
  });

  it('should call onClick when Enter key is pressed', async () => {
    const onClick = jest.fn();
    render(<Component onClick={onClick} />);

    const container = await screen.findByRole('link');
    container.focus();
    fireEvent.keyUp(container, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(onClick).toBeCalledTimes(1);
  });
});
