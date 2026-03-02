import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { withProviders } from '../../../../utils/storybook';
import { Skeleton } from './skeleton.component';

const Template: StoryFn = () => {
  return (
    <div className="w-[320px] p-4">
      <Skeleton />
    </div>
  );
};

const meta: Meta = {
  title: 'Routes/Documents/Document/Skeleton',
  component: Skeleton,
  decorators: [withProviders()],
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: Template,
};
