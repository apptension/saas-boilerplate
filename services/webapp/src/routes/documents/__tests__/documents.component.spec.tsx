import { times } from 'ramda';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { MockPayloadGenerator } from 'relay-test-utils';

import { Documents } from '../documents.component';
import { generateRelayEnvironmentDocuments } from '../documents.fixtures';
import { documentFactory } from '../../../mocks/factories';
import { render } from '../../../tests/utils/rendering';

describe('Documents: Component', () => {
  const Component = () => <Documents />;

  it('should render list of documents', () => {
    const documentsLength = 3;
    const relayEnvironment = generateRelayEnvironmentDocuments(times(() => documentFactory(), documentsLength));
    render(<Component />, { relayEnvironment });

    expect(screen.getAllByRole('listitem')).toHaveLength(documentsLength);
  });

  it('should render empty state', () => {
    const relayEnvironment = generateRelayEnvironmentDocuments([]);
    render(<Component />, { relayEnvironment });

    expect(screen.getByText('No documents')).toBeInTheDocument();
  });

  it('should add new item to the list', async () => {
    const relayEnvironment = generateRelayEnvironmentDocuments([documentFactory()]);
    render(<Component />, { relayEnvironment });

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
    const relayEnvironment = generateRelayEnvironmentDocuments([document]);
    render(<Component />, { relayEnvironment });

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
