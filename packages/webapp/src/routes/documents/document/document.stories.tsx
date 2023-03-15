import { documentFactory } from '@sb/webapp-api-client/tests/factories';
import { Story } from '@storybook/react';
import styled from 'styled-components';

import { withProviders } from '../../../shared/utils/storybook';
import { Document, DocumentProps } from './document.component';

const Container = styled.div`
  width: 200px;
  padding: 10px;
`;

const Template: Story<DocumentProps> = (args: DocumentProps) => {
  const generatedDoc = documentFactory();
  const { file, createdAt } = generatedDoc;
  const id = generatedDoc.id as string;

  return <Container>{generatedDoc && <Document {...args} item={{ id, file, createdAt }} />}</Container>;
};

export default {
  title: 'Routes/Documents/Document',
  component: Document,
  decorators: [withProviders({})],
  argTypes: {
    item: {
      control: {
        type: null,
      },
    },
  },
};

export const Default = Template.bind({});
