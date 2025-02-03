import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';

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
  title: 'Core / UI / Forms / Select',
  component: Template,
};

export default meta;

export const Default: StoryObj<typeof meta> = {};
