import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { Notification, NotificationProps } from '../notification.component';
import { makeContextRenderer, PLACEHOLDER_CONTENT, PLACEHOLDER_TEST_ID } from '../../../../utils/testUtils';
import { mockedNotificationProps } from '../notification.fixtures';

describe('Notification: Component', () => {
  const defaultProps: NotificationProps = {
    ...mockedNotificationProps,
  };

  const component = (props: Partial<NotificationProps>) => <Notification {...defaultProps} {...props} />;
  const render = makeContextRenderer(component);

  it('should render title', () => {
    render({
      title: PLACEHOLDER_CONTENT,
    });

    expect(screen.getByTestId(PLACEHOLDER_TEST_ID)).toBeInTheDocument();
  });

  it('should render content', () => {
    render({
      content: PLACEHOLDER_CONTENT,
    });

    expect(screen.getByTestId(PLACEHOLDER_TEST_ID)).toBeInTheDocument();
  });

  it('should call onClick', () => {
    const onClick = jest.fn();
    render({
      onClick,
    });

    const container = screen.getByRole('link');
    fireEvent.click(container);

    expect(onClick).toBeCalledTimes(1);
  });
});
