import { useQuery } from '@apollo/client';

import { CONFIG_CONTENTFUL_APP_CONFIG_QUERY } from '../../modules/config/config.graphql';
import { MarkdownPage } from '../../shared/components/markdownPage';
import { SchemaType } from '../../shared/services/graphqlApi/apolloClient';

export const TermsAndConditions = () => {
  const { data, loading } = useQuery(CONFIG_CONTENTFUL_APP_CONFIG_QUERY, {
    context: { schemaType: SchemaType.Contentful },
  });

  if (loading) {
    return null;
  }
  return <MarkdownPage markdown={data?.appConfigCollection?.items?.[0]?.termsAndConditions} />;
};
