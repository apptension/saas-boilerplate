import { makeFragmentData } from '@sb/webapp-api-client';
import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { documentListItemFragment } from '../';
import { documentFactory } from '../../../tests/factories';
import { withProviders } from '../../../utils/storybook';
import { Document, DocumentProps } from './document.component';

const generatedDoc = documentFactory();

const Template: StoryFn<DocumentProps> = (args: DocumentProps) => {
  return (
    <div className="w-[320px] p-4">
      <Document {...args} />
    </div>
  );
};

const meta: Meta<typeof Document> = {
  title: 'Routes/Documents/Document',
  component: Document,
  decorators: [withProviders({})],
  args: {
    item: makeFragmentData(
      {
        id: generatedDoc.id as string,
        file: generatedDoc.file,
        createdAt: generatedDoc.createdAt,
      },
      documentListItemFragment
    ),
  },
  argTypes: {
    item: {
      control: false,
    },
  },
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: Template,
};
