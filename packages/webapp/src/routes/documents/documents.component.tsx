import { useQuery } from '@apollo/client';
import { isEmpty } from 'ramda';
import { FormattedMessage } from 'react-intl';

import { EmptyState } from '../../shared/components/emptyState';
import { Dropzone } from '../../shared/components/forms/dropzone';
import { useMappedConnection } from '../../shared/hooks/useMappedConnection';
import { DocumentsListQueryQuery } from '../../shared/services/graphqlApi/__generated/gql/graphql';
import { Document, DocumentSkeleton } from './document';
import { MAX_FILES, MAX_FILE_SIZE } from './documents.constants';
import { documentsListQuery } from './documents.graphql';
import { useHandleDrop } from './documents.hooks';
import { Container, Header, List } from './documents.styles';

type ListContentProps = {
  data: DocumentsListQueryQuery;
};

export const ListContent = ({ data }: ListContentProps) => {
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
  const { data } = useQuery(documentsListQuery);

  return (
    <Container>
      <Header>
        <FormattedMessage defaultMessage="Documents" id="Documents / Header" />
      </Header>
      {data ? (
        <ListContent data={data} />
      ) : (
        <>
          <Dropzone disabled />
          <List>
            <DocumentSkeleton />
            <DocumentSkeleton />
          </List>
        </>
      )}
    </Container>
  );
};
