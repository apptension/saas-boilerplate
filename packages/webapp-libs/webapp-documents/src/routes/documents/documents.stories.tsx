import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { append } from 'ramda';

import { fillDocumentsListQuery } from '../../tests/factories';
import { withProviders } from '../../utils/storybook';
import { Documents } from './documents.component';

const Template: StoryFn = () => {
  return <Documents />;
};

const meta: Meta = {
  title: 'Routes/Documents',
  component: Documents,
  decorators: [
    withProviders({
      apolloMocks: append(fillDocumentsListQuery()),
    }),
  ],
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: Template,
};
