import { Story } from '@storybook/react';
import { append } from 'ramda';

import { fillDocumentsListQuery } from '../../mocks/factories';
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
      apolloMocks: append(fillDocumentsListQuery(undefined)),
    }),
  ],
};

export const Default = Template.bind({});
