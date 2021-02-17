import React from 'react';
import { Story } from '@storybook/react';

import { crudDemoItemFactory } from '../../../mocks/factories';
import { ProvidersWrapper } from '../../../shared/utils/testUtils';
import { CrudDemoItemForm, CrudDemoItemFormProps } from './crudDemoItemForm.component';

const item = crudDemoItemFactory();

const Template: Story<CrudDemoItemFormProps> = (args) => {
  return (
    <ProvidersWrapper>
      <CrudDemoItemForm {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'CrudDemoItem / CrudDemoItemForm',
  component: CrudDemoItemForm,
};

export const WithInitialData = Template.bind({});
WithInitialData.args = { data: item };

export const WithoutData = Template.bind({});
WithoutData.args = {};
