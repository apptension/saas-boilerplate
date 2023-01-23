import { Story } from '@storybook/react';
import { withProviders } from '../../shared/utils/storybook';
import { fillDocumentsListQuery } from '../../mocks/factories';
import { fillCommonQueryWithUser } from '../../shared/utils/commonQuery';
import { Documents } from './documents.component';

const Template: Story = () => {
  return <Documents />;
};

export default {
  title: 'Routes/Documents',
  component: Documents,
  decorators: [
    withProviders({
      relayEnvironment: (env) => {
        fillCommonQueryWithUser(env);
        fillDocumentsListQuery(env);
      },
    }),
  ],
};

export const Default = Template.bind({});
