import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { DropdownMenu, DropdownMenuTrigger } from './dropdownMenu.component';
import { DropdownMenuContent } from './dropdownMenuContent';
import { DropdownMenuItem } from './dropdownMenuItem';
import { DropdownMenuLabel } from './dropdownMenuLabel';
import { DropdownMenuSeparator } from './dropdownMenuSeparator';

const Template: StoryFn = () => {
  return (
    <div className="flex w-full p-8">
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Team</DropdownMenuItem>
          <DropdownMenuItem>Subscription</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const meta: Meta = {
  title: 'Core / Dropdown Menu',
  component: Template,
};

export default meta;

export const Default: StoryObj<typeof meta> = {};
