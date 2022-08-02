import { Story } from '@storybook/react';
import { FileSize, FileSizeProps } from './fileSize.component';

const Template: Story<FileSizeProps> = (args: FileSizeProps) => {
  return <FileSize {...args} />;
};

export default {
  title: 'Shared/FileSize',
  component: FileSize,
};

export const Bytes = Template.bind({});
Bytes.args = { size: 102 };

export const Kilobytes = Template.bind({});
Kilobytes.args = { size: 2048 };

export const Decimal = Template.bind({});
Decimal.args = { size: 1300 };

export const NoDecimal = Template.bind({});
NoDecimal.args = { size: 1300, decimals: 0 };
