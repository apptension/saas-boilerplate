import { identity } from 'ramda';
import graphql from 'babel-plugin-relay/macro';
import { useLazyLoadQuery } from 'react-relay';
import { screen, waitFor } from '@testing-library/react';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { act } from 'react-test-renderer';
import { Suspense } from 'react';

import { render } from '../../../../tests/utils/rendering';
import { mapConnection } from '../../../../shared/utils/graphql';
import { documentFactory } from '../../../../mocks/factories';
import { fillCommonQueryWithUser } from '../../../../shared/utils/commonQuery';
import { Document } from '../document.component';
import { documentsListTestQuery } from './__generated__/documentsListTestQuery.graphql';

describe('Document: Component', () => {
  const TestRenderer = () => {
    const data = useLazyLoadQuery<documentsListTestQuery>(
      graphql`
        query documentsListTestQuery @relay_test_operation {
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

    const [document] = mapConnection(identity, data.allDocumentDemoItems);
    return <Document item={document} />;
  };
  const Component = () => (
    <Suspense fallback="Loading">
      <TestRenderer />
    </Suspense>
  );

  it('should render file link', async () => {
    const { file } = documentFactory();
    const relayEnvironment = createMockEnvironment();
    fillCommonQueryWithUser(relayEnvironment);
    render(<Component />, { relayEnvironment });

    await waitFor(() => {
      act(() => {
        relayEnvironment.mock.resolveMostRecentOperation((operation) =>
          MockPayloadGenerator.generate(operation, {
            DocumentDemoItemType: (context, generateId) => ({
              ...documentFactory({
                file,
              }),
              id: `${generateId()}`,
            }),
          })
        );
      });
    });

    const fileLink = await screen.findByRole('link', { name: file?.name ?? '' });
    expect(fileLink).toHaveAttribute('href', file?.url);
  });
});
