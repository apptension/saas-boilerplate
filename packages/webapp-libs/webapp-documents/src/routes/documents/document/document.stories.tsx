import { makeFragmentData } from '@sb/webapp-api-client';
import { Meta, StoryFn, StoryObj } from '@storybook/react';
import styled from 'styled-components';

import { documentListItemFragment } from '../';
import { documentFactory } from '../../../tests/factories';
import { withProviders } from '../../../utils/storybook';
import { Document, DocumentProps } from './document.component';

const Container = styled.div`
  width: 200px;
  padding: 10px;
`;

const Template: StoryFn<DocumentProps> = (args: DocumentProps) => {
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

const meta: Meta<typeof Document> = {
  title: 'Routes/Documents/Document',
  component: Document,
  decorators: [withProviders({})],
  argTypes: {
    item: {
      control: {
        type: undefined,
      },
    },
  },
};

export default meta;

export const Default: StoryObj<typeof meta & DocumentProps> = {
  render: Template,
};
