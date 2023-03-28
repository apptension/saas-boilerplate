import { makeFragmentData } from '@sb/webapp-api-client';
import { documentFactory } from '@sb/webapp-api-client/tests/factories';
import { Story } from '@storybook/react';
import styled from 'styled-components';

import { documentListItemFragment } from '../';
import { withProviders } from '../../../utils/storybook';
import { Document, DocumentProps } from './document.component';

const Container = styled.div`
  width: 200px;
  padding: 10px;
`;

const Template: Story<DocumentProps> = (args: DocumentProps) => {
  const generatedDoc = documentFactory();
  const { file, createdAt } = generatedDoc;
  const id = generatedDoc.id as string;

  return (
    <Container>
      {generatedDoc && (
        <Document {...args} item={makeFragmentData({ id, file, createdAt }, documentListItemFragment)} />
      )}
    </Container>
  );
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
