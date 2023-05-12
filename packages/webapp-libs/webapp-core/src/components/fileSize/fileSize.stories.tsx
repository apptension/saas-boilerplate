import { StoryFn } from '@storybook/react';
import { FileSize, FileSizeProps } from './fileSize.component';

const Template: StoryFn<FileSizeProps> = (args: FileSizeProps) => {
  return <FileSize {...args} />;
};

export default {
  title: 'Core/FileSize',
  component: FileSize,
};

export const Bytes = {
  render: Template,
  args: { size: 102 },
};

export const Kilobytes = {
  render: Template,
  args: { size: 2048 },
};

export const Decimal = {
  render: Template,
  args: { size: 1300 },
};

export const NoDecimal = {
  render: Template,
  args: { size: 1300, decimals: 0 },
};
