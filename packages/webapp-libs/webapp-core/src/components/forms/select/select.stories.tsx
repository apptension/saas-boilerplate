import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { Select, SelectValue } from './select.component';
import { SelectContent } from './selectContent';
import { SelectItem } from './selectItem';
import { SelectTrigger } from './selectTrigger';

const Template: StoryFn = () => {
  return (
    <div className="flex w-full p-8">
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="opt1">Option 1</SelectItem>
          <SelectItem value="opt2">Option 2</SelectItem>
          <SelectItem value="opt3">Option 3</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

const meta: Meta = {
  title: 'Core / Forms / Select',
  component: Template,
};

export default meta;

export const Default: StoryObj<typeof meta> = {};
