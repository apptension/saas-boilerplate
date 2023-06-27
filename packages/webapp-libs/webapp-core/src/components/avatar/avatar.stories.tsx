import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { Avatar } from './avatar.component';
import { AvatarFallback } from './avatarFallback';
import { AvatarImage } from './avatarImage';

const Template: StoryFn = () => {
  return (
    <div className="flex p-8">
      <Avatar>
        <AvatarImage />
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
    </div>
  );
};

const meta: Meta = {
  title: 'Core / Avatar',
  component: Template,
};

export default meta;

export const Default: StoryObj<typeof meta> = {};
