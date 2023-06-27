import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { Skeleton } from './skeleton.component';

const Template: StoryFn = () => {
  return (
    <div className="flex w-full p-8">
      <Skeleton className="h-8 w-48" />
    </div>
  );
};

const meta: Meta = {
  title: 'Core / Skeleton',
  component: Template,
};

export default meta;

export const Default: StoryObj<typeof meta> = {};
