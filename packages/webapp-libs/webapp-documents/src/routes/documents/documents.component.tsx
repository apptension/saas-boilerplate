import { useQuery } from '@apollo/client/react';
import { DocumentsListQueryQuery } from '@sb/webapp-api-client/graphql';
import { Dropzone } from '@sb/webapp-core/components/forms';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Paragraph } from '@sb/webapp-core/components/typography';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { useMappedConnection } from '@sb/webapp-core/hooks';
import { PermissionGate } from '@sb/webapp-tenants/hooks';
import { FileText, Upload } from 'lucide-react';
import { isEmpty } from 'ramda';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';

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
      {/* Upload Card - Only shown to users with manage permission */}
      <PermissionGate permissions="features.documents.manage">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              <FormattedMessage defaultMessage="Upload documents" id="Documents / Upload title" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage
                defaultMessage="Drag and drop files here, or click to browse. Maximum 10 documents allowed."
                id="Documents / Upload description"
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </PermissionGate>

      {/* Documents List Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <FormattedMessage defaultMessage="Your documents" id="Documents / List title" />
          </CardTitle>
          <CardDescription>
            <FormattedMessage
              defaultMessage="Manage and view your uploaded documents"
              id="Documents / List description"
            />
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEmpty(documents) ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                <FormattedMessage defaultMessage="No documents yet" id="Documents / Empty title" />
              </h3>
              <p className="text-sm text-muted-foreground">
                <FormattedMessage
                  defaultMessage="Upload your first document using the dropzone above"
                  id="Documents / Empty description"
                />
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-[repeat(auto-fill,_minmax(280px,_1fr))] gap-4">
              {documents.map((document) => (
                <Document item={document} key={document.id} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export const Documents = () => {
  const intl = useIntl();
  const { data, loading } = useQuery(documentsListQuery);

  return (
    <PageLayout>
      <Helmet
        title={intl.formatMessage({
          defaultMessage: 'Documents',
          id: 'Documents / page title',
        })}
      />

      <div className="mx-auto w-full max-w-5xl space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              <FormattedMessage defaultMessage="Documents" id="Documents / Header" />
            </h1>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            <FormattedMessage
              defaultMessage="Upload, manage and organize your documents in one place"
              id="Documents / subheading"
            />
          </Paragraph>
        </div>

        {/* Content */}
        {data && !loading ? (
          <ListContent data={data} />
        ) : (
          <>
            {/* Upload Card Skeleton - Only shown to users with manage permission */}
            <PermissionGate permissions="features.documents.manage">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    <FormattedMessage defaultMessage="Upload documents" id="Documents / Upload title" />
                  </CardTitle>
                  <CardDescription>
                    <FormattedMessage
                      defaultMessage="Drag and drop files here, or click to browse. Maximum 10 documents allowed."
                      id="Documents / Upload description"
                    />
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Dropzone disabled />
                </CardContent>
              </Card>
            </PermissionGate>

            {/* Documents List Card Skeleton */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <FormattedMessage defaultMessage="Your documents" id="Documents / List title" />
                </CardTitle>
                <CardDescription>
                  <FormattedMessage
                    defaultMessage="Manage and view your uploaded documents"
                    id="Documents / List description"
                  />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-[repeat(auto-fill,_minmax(280px,_1fr))] gap-4">
                  <DocumentSkeleton />
                  <DocumentSkeleton />
                  <DocumentSkeleton />
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageLayout>
  );
};
