import { identity } from 'ramda';
import graphql from 'babel-plugin-relay/macro';
import { useLazyLoadQuery } from 'react-relay';
import { screen, waitFor } from '@testing-library/react';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { act } from 'react-test-renderer';
import { Suspense } from 'react';

import { makeContextRenderer } from '../../../../shared/utils/testUtils';
import { documentsListTestQuery } from '../../../../__generated__/documentsListTestQuery.graphql';
import { mapConnection } from '../../../../shared/utils/graphql';
import { documentFactory } from '../../../../mocks/factories';
import { DeepPartial } from '../../../../shared/utils/types';
import { DocumentDemoItemType } from '../../../../shared/services/graphqlApi/__generated/types';
import { Document } from '../document.component';
import { fillCommonQueryWithUser } from '../../../../shared/utils/commonQuery';

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
  const render = makeContextRenderer(() => (
    <Suspense fallback="Loading">
      <TestRenderer />
    </Suspense>
  ));

  const renderDocument = async (document?: DeepPartial<DocumentDemoItemType>) => {
    const relayEnvironment = createMockEnvironment();
    fillCommonQueryWithUser(relayEnvironment);
    render({}, { relayEnvironment });

    await waitFor(() => {
      act(() => {
        relayEnvironment.mock.resolveMostRecentOperation((operation) =>
          MockPayloadGenerator.generate(operation, {
            DocumentDemoItemType: (context, generateId) => ({
              ...documentFactory(document),
              id: `${generateId()}`,
            }),
          })
        );
      });
    });
  };

  it('should render file link', async () => {
    const { file } = documentFactory();
    await renderDocument({
      file,
    });

    const fileLink = await screen.findByRole('link', { name: file?.name ?? '' });
    expect(fileLink).toHaveAttribute('href', file?.url);
  });
});
