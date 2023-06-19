import { useQuery } from '@apollo/client';
import { DocumentsListQueryQuery } from '@sb/webapp-api-client/graphql';
import { EmptyState } from '@sb/webapp-core/components/emptyState';
import { Dropzone } from '@sb/webapp-core/components/forms';
import { useMappedConnection } from '@sb/webapp-core/hooks';
import { isEmpty } from 'ramda';
import { FormattedMessage } from 'react-intl';

import { Document, DocumentSkeleton } from './document';
import { MAX_FILES, MAX_FILE_SIZE } from './documents.constants';
import { documentsListQuery } from './documents.graphql';
import { useHandleDrop } from './documents.hooks';

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
        <ul className="grid mt-6 grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))] gap-4">
          {documents.map((document) => (
            <Document item={document} key={document.id} />
          ))}
        </ul>
      )}
    </>
  );
};

export const Documents = () => {
  const { data } = useQuery(documentsListQuery);

  return (
    <div className="px-8 space-y-6 ">
      <div>
        <h3 className="text-lg font-medium">
          <FormattedMessage defaultMessage="Documents" id="Documents / Header" />
        </h3>
        <p className="text-sm text-muted-foreground">
          <FormattedMessage
            defaultMessage="You can drag files to a specific area, to upload. Alternatively, you can also upload by selecting."
            id="Finances / Stripe / Payment confirm / subheading"
          />
        </p>
      </div>
      {data ? (
        <ListContent data={data} />
      ) : (
        <>
          <Dropzone disabled />
          <ul className="grid mt-6 grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))] gap-4">
            <DocumentSkeleton />
            <DocumentSkeleton />
          </ul>
        </>
      )}
    </div>
  );
};
