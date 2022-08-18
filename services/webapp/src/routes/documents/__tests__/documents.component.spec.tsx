import { times } from 'ramda';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { MockPayloadGenerator } from 'relay-test-utils';
import { Documents } from '../documents.component';
import { makeContextRenderer } from '../../../shared/utils/testUtils';
import { generateRelayEnvironmentDocuments } from '../documents.fixtures';
import { documentFactory } from '../../../mocks/factories';
import { DeepPartial } from '../../../shared/utils/types';
import { DocumentDemoItemType } from '../../../shared/services/graphqlApi/__generated/types';

describe('Documents: Component', () => {
  const component = () => <Documents />;
  const render = makeContextRenderer(component);

  const renderDocuments = (documents: DeepPartial<DocumentDemoItemType>[]) => {
    const relayEnvironment = generateRelayEnvironmentDocuments(documents);
    const rendered = render({}, { relayEnvironment });
    return {
      ...rendered,
      relayEnvironment,
    };
  };

  it('should render list of documents', () => {
    const documentsLength = 3;
    renderDocuments(times(() => documentFactory(), documentsLength));

    expect(screen.getAllByRole('listitem')).toHaveLength(documentsLength);
  });

  it('should render empty state', () => {
    renderDocuments([]);

    expect(screen.getByText('No documents')).toBeInTheDocument();
  });

  it('should add new item to the list', async () => {
    const { relayEnvironment } = renderDocuments([documentFactory()]);

    const file = new File(['content'], 'file.png', { type: 'image/png' });
    fireEvent.change(screen.getByTestId('file-input'), {
      target: { files: [file] },
    });

    await waitFor(() => {
      act(() => {
        relayEnvironment.mock.resolveMostRecentOperation((operation) =>
          MockPayloadGenerator.generate(operation, {
            DocumentDemoItemType: (context, generateId) => ({
              ...documentFactory({ file: { name: file.name } }),
              id: `${generateId()}`,
            }),
          })
        );
      });
    });

    expect(screen.getByText(file.name)).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('should remove new item from the list', async () => {
    const document = documentFactory();
    const { relayEnvironment } = renderDocuments([document]);

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      act(() => {
        relayEnvironment.mock.resolveMostRecentOperation((operation) =>
          MockPayloadGenerator.generate(operation, {
            DeleteDocumentDemoItemMutationPayload: () => ({ deletedIds: [document.id] }),
          })
        );
      });
    });

    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});
