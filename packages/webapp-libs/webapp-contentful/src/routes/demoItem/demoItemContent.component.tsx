import { DemoItemQueryQuery } from '@sb/webapp-api-client/graphql';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Paragraph } from '@sb/webapp-core/components/typography';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { ArrowLeft, FileText, Image as ImageIcon } from 'lucide-react';
import { FC, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useNavigate } from 'react-router-dom';

import { imageProps } from '../../helpers/image';

type DemoItemContentProps = {
  data: DemoItemQueryQuery;
  routesConfig: {
    notFound: string;
    list: string;
  };
};

export const DemoItemContent: FC<DemoItemContentProps> = ({ data, routesConfig }) => {
  const item = data.demoItem;
  const intl = useIntl();

  const generateLocalePath = useGenerateLocalePath();
  const navigate = useNavigate();

  useEffect(() => {
    if (!item) {
      navigate(generateLocalePath(routesConfig.notFound));
    }
  }, [routesConfig.notFound, generateLocalePath, navigate, item]);

  const { alt, src } = imageProps(item?.image);

  if (!item) {
    return null;
  }

  return (
    <PageLayout>
      <Helmet
        title={intl.formatMessage(
          {
            defaultMessage: '{title} - Content Item',
            id: 'Contentful Item / Page title',
          },
          { title: item.title }
        )}
      />

      <div className="mx-auto w-full max-w-5xl space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <Link
            to={generateLocalePath(routesConfig.list)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <FormattedMessage defaultMessage="Back to content items" id="Contentful Item / Back" />
          </Link>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">{item.title}</h1>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            <FormattedMessage
              defaultMessage="Content managed in Contentful CMS"
              id="Contentful Item / Description"
            />
          </Paragraph>
        </div>

        {/* Image Card */}
        {src && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                <FormattedMessage defaultMessage="Featured Image" id="Contentful Item / Image title" />
              </CardTitle>
              <CardDescription>
                <FormattedMessage
                  defaultMessage="Image asset from Contentful"
                  id="Contentful Item / Image description"
                />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg bg-muted">
                <img
                  src={src}
                  alt={alt}
                  className="w-full max-h-96 object-contain"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Card */}
        {item.description && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <FormattedMessage defaultMessage="Description" id="Contentful Item / Content title" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Paragraph className="text-base whitespace-pre-wrap leading-relaxed">
                {item.description}
              </Paragraph>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};
