import { useQuery } from '@apollo/client';
import { MarkdownPage } from '@saas-boilerplate-app/webapp-core/components/markdownPage';

import { configContentfulAppQuery } from '../../modules/config/config.graphql';
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
