import { Meta, StoryObj } from '@storybook/react';

import { Alert } from './alert.component';
import { AlertDescription } from './alertDescription';
import { AlertTitle } from './alertTitle';

type Story = StoryObj<typeof Alert>;

const meta: Meta<typeof Alert> = {
  title: 'Core/Alert',
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
