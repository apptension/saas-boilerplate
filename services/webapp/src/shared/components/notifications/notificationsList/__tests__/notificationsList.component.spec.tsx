import React from 'react';

import { makeContextRenderer } from '../../../../utils/testUtils';
import { NotificationsList, NotificationsListProps } from '../notificationsList.component';

describe('NotificationsList: Component', () => {
  const defaultProps: NotificationsListProps = {};

  const component = (props: Partial<NotificationsListProps>) => <NotificationsList {...defaultProps} {...props} />;
  const render = makeContextRenderer(component);

  it('should render without errors', () => {
    render();
  });
});
