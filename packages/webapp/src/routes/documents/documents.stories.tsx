import { Story } from '@storybook/react';
import { append } from 'ramda';

import { fillDocumentsListQuery } from '../../tests/factories';
import { withProviders } from '../../shared/utils/storybook';
import { Documents } from './documents.component';

const Template: Story = () => {
  return <Documents />;
};

export default {
  title: 'Routes/Documents',
  component: Documents,
  decorators: [
    withProviders({
      apolloMocks: append(fillDocumentsListQuery()),
    }),
  ],
};

export const Default = Template.bind({});
