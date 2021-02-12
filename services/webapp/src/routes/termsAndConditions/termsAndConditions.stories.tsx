import React from 'react';
import { Story } from '@storybook/react';

import { prepareState } from '../../mocks/store';
import { appConfigFactory } from '../../mocks/factories';
import { ProvidersWrapper } from '../../shared/utils/testUtils';
import { TermsAndConditions } from './termsAndConditions.component';

const store = prepareState((state) => {
  state.config = appConfigFactory();
});

const Template: Story = (args) => {
  return (
    <ProvidersWrapper context={{ store }}>
      <TermsAndConditions {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Routes/TermsAndConditions',
  component: TermsAndConditions,
};

export const Default = Template.bind({});
