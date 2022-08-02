import { Story } from '@storybook/react';
import { appConfigFactory } from '../../mocks/factories';
import { ProvidersWrapper } from '../../shared/utils/testUtils';
import { TermsAndConditions } from './termsAndConditions.component';

const Template: Story = () => {
  return (
    <ProvidersWrapper
      context={{
        store: (state) => {
          state.config = appConfigFactory();
        },
      }}
    >
      <TermsAndConditions />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Routes/TermsAndConditions',
  component: TermsAndConditions,
};

export const Default = Template.bind({});
