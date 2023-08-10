import { NotificationTypes } from '@sb/webapp-notifications';
import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { withProviders } from '../../utils/storybook';
import { CrudItemUpdated, CrudItemUpdatedProps } from './crudItemUpdated.component';

const Template: StoryFn<CrudItemUpdatedProps> = (args: CrudItemUpdatedProps) => {
  return <CrudItemUpdated {...args} />;
};

const meta: Meta = {
  title: 'Crud Demo Item/Notifications/CrudItemUpdated',
  component: Template,
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  args: {
    type: NotificationTypes.CRUD_ITEM_UPDATED,
    readAt: null,
    createdAt: '2021-06-17T11:45:33',
    id: 'mock-uuid',
    data: {
      id: 'data-mock-uuid',
      name: 'Lorem ipsum',
    },
    issuer: {
      id: 'mock-user-uuid',
      email: 'example@example.com',
      avatar: 'https://picsum.photos/24/24',
    }
  },

  decorators: [withProviders()],
};
