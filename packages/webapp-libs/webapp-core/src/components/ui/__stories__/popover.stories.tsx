import { PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Button } from '../../buttons';
import { Popover } from '../popover';

const Template: StoryFn = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex w-full p-8">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger>
          <Button>Open popover</Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-primary-foreground w-48 rounded-md border-2 p-2 text-center shadow-sm"
          sideOffset={6}
        >
          Content
        </PopoverContent>
      </Popover>
    </div>
  );
};

const meta: Meta = {
  title: 'Core / UI / Popover',
  component: Template,
};

export default meta;

export const Default: StoryObj<typeof meta> = {};
