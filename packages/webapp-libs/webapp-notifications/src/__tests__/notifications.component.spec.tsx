import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ElementType } from 'react';

import { Notifications } from '../notifications.component';
import { NotificationTypes } from '../notifications.types';
import { render } from '../tests/utils/rendering';

describe('Notifications: Component', () => {
  const templates: Record<NotificationTypes, ElementType> = {
    [NotificationTypes.CRUD_ITEM_CREATED]: () => <>CRUD_ITEM_CREATED</>,
    [NotificationTypes.CRUD_ITEM_UPDATED]: () => <>CRUD_ITEM_UPDATED</>,
  };

  const Component = () => <Notifications templates={templates} />;

  it('Should show trigger button', async () => {
    render(<Component />);

    expect(await screen.findByLabelText('Open notifications')).toBeInTheDocument();
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });

  it('Should open notifications center', async () => {
    render(<Component />);

    await userEvent.click(await screen.findByTestId('notifications-trigger-testid'));
    expect(await screen.findByText('Notifications')).toBeInTheDocument();
  });
});
