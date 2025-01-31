import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { RadioGroup, RadioGroupItem } from '../radio-group';

const Template: StoryFn = () => {
  return (
    <div className="flex p-8">
      <RadioGroup>
        <RadioGroupItem value="example1" />
        <RadioGroupItem value="example2" />
        <RadioGroupItem value="example3" />
        <RadioGroupItem value="example4" />
      </RadioGroup>
    </div>
  );
};

const meta: Meta = {
  title: 'Core / UI / Forms / Radio',
  component: Template,
};

export default meta;

export const Default: StoryObj<typeof meta> = {};
