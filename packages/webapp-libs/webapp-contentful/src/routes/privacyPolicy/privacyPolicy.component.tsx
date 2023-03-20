import { useQuery } from '@apollo/client';
import { SchemaType } from '@sb/webapp-api-client';
import { MarkdownPage } from '@sb/webapp-core/components/markdownPage';

import { configContentfulAppQuery } from '../../config/config.graphql';

export const PrivacyPolicy = () => {
  const { data, loading } = useQuery(configContentfulAppQuery, {
    context: { schemaType: SchemaType.Contentful },
  });

  if (loading) {
    return null;
  }

  return <MarkdownPage markdown={data?.appConfigCollection?.items?.[0]?.privacyPolicy} />;
};
