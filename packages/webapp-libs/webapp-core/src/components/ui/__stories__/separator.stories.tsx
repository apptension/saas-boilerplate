import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { Separator } from '../separator';

const Template: StoryFn = () => {
  return (
    <div className="flex w-full p-8">
      <Separator />
    </div>
  );
};

const meta: Meta = {
  title: 'Core / UI / Separator',
  component: Template,
};

export default meta;

export const Default: StoryObj<typeof meta> = {};
