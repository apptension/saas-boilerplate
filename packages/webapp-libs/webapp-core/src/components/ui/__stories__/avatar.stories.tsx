import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { Avatar, AvatarFallback, AvatarImage } from '../avatar';

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
  title: 'Core / UI / Avatar',
  component: Template,
};

export default meta;

export const Default: StoryObj<typeof meta> = {};
