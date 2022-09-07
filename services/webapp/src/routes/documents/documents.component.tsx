import { FormattedMessage } from 'react-intl';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';
import { Suspense } from 'react';
import { isEmpty } from 'ramda';
import { Dropzone } from '../../shared/components/forms/dropzone';
import { EmptyState } from '../../shared/components/emptyState';
import { useMappedConnection } from '../../shared/hooks/useMappedConnection';
import DocumentsListQuery, { documentsListQuery } from './__generated__/documentsListQuery.graphql';
import { Container, Header, List } from './documents.styles';
import { Document, DocumentSkeleton } from './document';
import { MAX_FILE_SIZE, MAX_FILES } from './documents.constants';
import { useDocumentsListQueryLoader, useHandleDrop } from './documents.hooks';

type ListContentProps = {
  listQueryRef: PreloadedQuery<documentsListQuery>;
};

export const ListContent = ({ listQueryRef }: ListContentProps) => {
  const data = usePreloadedQuery(DocumentsListQuery, listQueryRef);
  const documents = useMappedConnection(data.allDocumentDemoItems);
  const handleDrop = useHandleDrop();

  const isMaximumSizeExceeded = documents.length >= MAX_FILES;

  return (
    <>
      <Dropzone
        onDrop={handleDrop}
        maxFiles={1}
        maxSize={MAX_FILE_SIZE}
        disabled={isMaximumSizeExceeded}
        label={
          isMaximumSizeExceeded ? (
            <FormattedMessage
              defaultMessage="Cannot upload more than 10 documents"
              id="Documents / Maximum size exceeded"
            />
          ) : undefined
        }
      />

      {isEmpty(documents) ? (
        <EmptyState>
          <FormattedMessage defaultMessage="No documents" id="Documents / Empty" />
        </EmptyState>
      ) : (
        <List>
          {documents.map((document) => (
            <Document item={document} key={document.id} />
          ))}
        </List>
      )}
    </>
  );
};

export const Documents = () => {
  const listQueryRef = useDocumentsListQueryLoader();

  return (
    <Container>
      <Header>
        <FormattedMessage defaultMessage="Documents" id="Documents / Header" />
      </Header>
      {listQueryRef && (
        <Suspense
          fallback={
            <>
              <Dropzone disabled />
              <List>
                <DocumentSkeleton />
                <DocumentSkeleton />
              </List>
            </>
          }
        >
          <ListContent listQueryRef={listQueryRef} />
        </Suspense>
      )}
    </Container>
  );
};
