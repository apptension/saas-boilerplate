import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { Separator } from './separator.component';

const Template: StoryFn = () => {
  return (
    <div className="flex w-full p-8">
      <Separator />
    </div>
  );
};

const meta: Meta = {
  title: 'Core / Separator',
  component: Template,
};

export default meta;

export const Default: StoryObj<typeof meta> = {};
