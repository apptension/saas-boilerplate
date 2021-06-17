import React from 'react';

import { NotificationsButton, NotificationsButtonProps } from '../notificationsButton.component';
import { makeContextRenderer } from '../../../../utils/testUtils';

describe('NotificationsButton: Component', () => {
  const defaultProps: NotificationsButtonProps = {};

  const component = (props: Partial<NotificationsButtonProps>) => <NotificationsButton {...defaultProps} {...props} />;
  const render = makeContextRenderer(component);

  it('should render without errors', () => {
    render();
  });
});
