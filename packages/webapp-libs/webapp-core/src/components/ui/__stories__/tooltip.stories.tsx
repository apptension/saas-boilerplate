import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../tooltip';

const Template: StoryFn = () => {
  return (
    <div className="flex w-full p-8">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

const meta: Meta<typeof Tooltip> = {
  title: 'Core/UI/Tooltip',
  component: Template,
};

export default meta;

export const Default: StoryObj<typeof meta> = {};
