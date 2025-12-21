import { Meta, StoryObj } from '@storybook/react';
import { append, times } from 'ramda';

import { documentFactory, fillDocumentsListQuery } from '../../tests/factories';
import { withProviders } from '../../utils/storybook';
import { Documents } from './documents.component';

const meta: Meta<typeof Documents> = {
  title: 'Routes/Documents',
  component: Documents,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof Documents>;

export const Default: Story = {
  decorators: [
    withProviders({
      apolloMocks: append(fillDocumentsListQuery(times(() => documentFactory(), 3))),
    }),
  ],
};

export const Empty: Story = {
  decorators: [
    withProviders({
      apolloMocks: append(fillDocumentsListQuery([])),
    }),
  ],
};

export const ManyDocuments: Story = {
  decorators: [
    withProviders({
      apolloMocks: append(fillDocumentsListQuery(times(() => documentFactory(), 8))),
    }),
  ],
};

export const MaxDocuments: Story = {
  decorators: [
    withProviders({
      apolloMocks: append(fillDocumentsListQuery(times(() => documentFactory(), 10))),
    }),
  ],
};
