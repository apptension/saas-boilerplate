import { DocumentsDeleteMutationMutation } from '@sb/webapp-api-client/graphql';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { times } from 'ramda';

import { documentFactory, fillDocumentDeleteQuery, fillDocumentsListQuery } from '../../../tests/factories';
import { render } from '../../../tests/utils/rendering';
import { Documents } from '../documents.component';

jest.mock('@sb/webapp-core/services/analytics');

describe('Documents: Component', () => {
  const Component = () => <Documents />;

  it('should render list of documents', async () => {
    const documentsLength = 3;
    const generatedDocs = times(() => documentFactory(), documentsLength);

    const mockRequest = fillDocumentsListQuery(generatedDocs);
    render(<Component />, { apolloMocks: (defaultMocks) => defaultMocks.concat(mockRequest) });

    expect(await screen.findAllByRole('link')).toHaveLength(documentsLength);
    expect(screen.getAllByRole('listitem')).toHaveLength(documentsLength);
  });

  it('should render empty state', async () => {
    const mockRequest = fillDocumentsListQuery([]);

    render(<Component />, { apolloMocks: (defaultMocks) => defaultMocks.concat(mockRequest) });

    expect(await screen.findByText('No documents')).toBeInTheDocument();
  });

  it('should render maximum size state', async () => {
    const documentsLength = 10;
    const generatedDocs = times(() => documentFactory(), documentsLength);

    const mockRequest = fillDocumentsListQuery(generatedDocs);
    render(<Component />, { apolloMocks: (defaultMocks) => defaultMocks.concat(mockRequest) });

    expect(await screen.findByText('Cannot upload more than 10 documents')).toBeInTheDocument();
  });

  it('should add new item to the list', async () => {
    const generatedDoc = documentFactory();

    const mockRequest = fillDocumentsListQuery([generatedDoc]);

    render(<Component />, {
      apolloMocks: (defaultMocks) => defaultMocks.concat(mockRequest),
    });

    const file = new File(['content'], `${generatedDoc.file?.name}`, { type: 'image/png' });

    fireEvent.change(await screen.findByTestId('file-input'), {
      target: { files: [file] },
    });

    expect(await screen.findByText(file.name)).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('should remove new item from the list', async () => {
    const generatedDoc = documentFactory();
    const id = generatedDoc.id as string;

    const mutationData: DocumentsDeleteMutationMutation = {
      deleteDocumentDemoItem: {
        deletedIds: [id],
        __typename: 'DeleteDocumentDemoItemMutationPayload',
      },
    };

    const deleteMutationMock = fillDocumentDeleteQuery(id, mutationData);
    deleteMutationMock.newData = jest.fn(() => ({
      data: mutationData,
    }));

    const mockRequest = fillDocumentsListQuery([generatedDoc]);

    render(<Component />, {
      apolloMocks: (defaultMocks) => defaultMocks.concat(mockRequest, deleteMutationMock),
    });
    fireEvent.click(await screen.findByRole('button', { name: /delete/i }));
    fireEvent.click(screen.getByText(/continue/i));

    expect(deleteMutationMock.newData).toHaveBeenCalled();
    await waitFor(() => expect(trackEvent).toHaveBeenCalledWith('document', 'delete', id));
  });
});
