import { useQuery } from '@apollo/client';

import { configContentfulAppQuery } from '../../modules/config/config.graphql';
import { MarkdownPage } from '../../shared/components/markdownPage';
import { SchemaType } from '../../shared/services/graphqlApi/apolloClient';

export const PrivacyPolicy = () => {
  const { data, loading } = useQuery(configContentfulAppQuery, {
    context: { schemaType: SchemaType.Contentful },
  });

  if (loading) {
    return null;
  }

  return <MarkdownPage markdown={data?.appConfigCollection?.items?.[0]?.privacyPolicy} />;
};
