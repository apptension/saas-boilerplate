import { Meta, StoryObj } from '@storybook/react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';

type Story = StoryObj<typeof Tabs>;

const meta: Meta<typeof Tabs> = {
  title: 'Core/UI/Tabs',
  component: Tabs,
};

export default meta;

export const Default: Story = {
  args: {
    defaultValue: 'first',
    children: (
      <>
        <TabsList>
          <TabsTrigger value="first">First tab</TabsTrigger>
          <TabsTrigger value="second">Second tab</TabsTrigger>
        </TabsList>
        <TabsContent value="first">First tab content.</TabsContent>
        <TabsContent value="second">Second tab content.</TabsContent>
      </>
    ),
  },
};
