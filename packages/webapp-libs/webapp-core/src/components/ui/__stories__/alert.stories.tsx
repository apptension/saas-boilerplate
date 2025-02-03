import { Meta, StoryObj } from '@storybook/react';

import { Alert, AlertDescription, AlertTitle } from '../alert';

type Story = StoryObj<typeof Alert>;

const meta: Meta<typeof Alert> = {
  title: 'Core/UI/Alert',
  component: Alert,
};

export default meta;

export const Default: Story = {
  render: () => (
    <div className="p-8">
      <Alert>
        <AlertTitle>title</AlertTitle>
        <AlertDescription>content</AlertDescription>
      </Alert>
    </div>
  ),
};
