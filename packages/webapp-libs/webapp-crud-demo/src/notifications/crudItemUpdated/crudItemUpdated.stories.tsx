import { NotificationTypes } from '@sb/webapp-notifications';
import { StoryFn } from '@storybook/react';

import { withProviders } from '../../utils/storybook';
import {
  CrudItemUpdated,
  CrudItemUpdatedProps,
} from './crudItemUpdated.component';

const Template: StoryFn<CrudItemUpdatedProps> = (
  args: CrudItemUpdatedProps
) => {
  return <CrudItemUpdated {...args} />;
};

export default {
  title: 'Notifications/CrudItemUpdated',
  component: CrudItemUpdated,
};

export const Default = {
  render: Template,

  args: {
    type: NotificationTypes.CRUD_ITEM_UPDATED,
    readAt: null,
    createdAt: '2021-06-17T11:45:33',
    id: 'mock-uuid',
    data: {
      id: 'data-mock-uuid',
      user: 'example@example.com',
      name: 'Lorem ipsum',
      avatar: 'https://picsum.photos/24/24',
    },
  },

  decorators: [withProviders()],
};
