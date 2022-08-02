import { Story } from '@storybook/react';
import { NotificationTypes } from '../../notifications.types';
import { CrudItemCreated, CrudItemCreatedProps } from './crudItemCreated.component';

const Template: Story<CrudItemCreatedProps> = (args: CrudItemCreatedProps) => {
  return <CrudItemCreated {...args} />;
};

export default {
  title: 'Notifications/CrudItemCreated',
  component: CrudItemCreated,
};

export const Default = Template.bind({});
Default.args = {
  type: NotificationTypes.CRUD_ITEM_CREATED,
  readAt: null,
  createdAt: '2021-06-17T11:45:33',
  id: 'mock-uuid',
  data: {
    id: 'data-mock-uuid',
    user: 'example@example.com',
    name: 'CRUD entry name',
    avatar: 'https://picsum.photos/24/24',
  },
};
