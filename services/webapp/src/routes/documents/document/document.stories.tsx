import { Story } from '@storybook/react';
import { useLazyLoadQuery } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { MockPayloadGenerator } from 'relay-test-utils';
import styled from 'styled-components';
import { withRelay } from '../../../shared/utils/storybook';
import { documentFactory } from '../../../mocks/factories/document';
import { connectionFromArray } from '../../../tests/utils/fixtures';
import { documentListItemStoryQuery } from './__generated__/documentListItemStoryQuery.graphql';
import { Document, DocumentProps } from './document.component';

const Container = styled.div`
  width: 200px;
  padding: 10px;
`;

const Template: Story<DocumentProps> = (args: DocumentProps) => {
  const data = useLazyLoadQuery<documentListItemStoryQuery>(
    graphql`
      query documentListItemStoryQuery @relay_test_operation {
        allDocumentDemoItems(first: 1) {
          edges {
            node {
              ...documentListItem
            }
          }
        }
      }
    `,
    {}
  );

  const item = data.allDocumentDemoItems?.edges[0]?.node;

  return <Container>{item && <Document {...args} item={item} />}</Container>;
};

export default {
  title: 'Routes/Documents/Document',
  component: Document,
  decorators: [
    withRelay((env) => {
      env.mock.queueOperationResolver((operation) =>
        MockPayloadGenerator.generate(operation, {
          DocumentDemoItemConnection: () => connectionFromArray([documentFactory()]),
        })
      );
    }),
  ],
  argTypes: {
    item: {
      control: {
        type: null,
      },
    },
  },
};

export const Default = Template.bind({});
