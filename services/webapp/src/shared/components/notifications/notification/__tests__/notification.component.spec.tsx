import React from 'react';

import { Notification, NotificationProps } from '../notification.component';
import { makeContextRenderer } from '../../../../utils/testUtils';

describe('Notification: Component', () => {
  const defaultProps: NotificationProps = {};

  const component = (props: Partial<NotificationProps>) => <Notification {...defaultProps} {...props} />;
  const render = makeContextRenderer(component);

  it('should render without errors', () => {
    render();
  });
});
