import { Story } from '@storybook/react';
import { times } from 'ramda';
import { withRedux, withRelay } from '../../shared/utils/storybook';
import { documentFactory } from '../../mocks/factories/document';
import { Documents } from './documents.component';
import { generateRelayEnvironmentDocuments } from './documents.fixtures';

const Template: Story = () => {
  return <Documents />;
};

export default {
  title: 'Routes/Documents',
  component: Documents,
  decorators: [withRedux(), withRelay(generateRelayEnvironmentDocuments(times(() => documentFactory(), 3)))],
};

export const Default = Template.bind({});
