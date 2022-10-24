import { PreloadedQuery, usePreloadedQuery, useQueryLoader } from 'react-relay';
import { FunctionComponent, Suspense, useEffect } from 'react';

import configContentfulAppConfigQueryGraphql, {
  configContentfulAppConfigQuery,
} from '../../modules/config/__generated__/configContentfulAppConfigQuery.graphql';
import { MarkdownPage } from '../../shared/components/markdownPage';

type PrivacyPolicyContentProps = {
  contentfulAppConfigQueryRef: PreloadedQuery<configContentfulAppConfigQuery>;
};

export const PrivacyPolicyContent: FunctionComponent<PrivacyPolicyContentProps> = ({ contentfulAppConfigQueryRef }) => {
  const { appConfigCollection } = usePreloadedQuery(configContentfulAppConfigQueryGraphql, contentfulAppConfigQueryRef);
  return <MarkdownPage markdown={appConfigCollection?.items?.[0]?.privacyPolicy} />;
};

export const PrivacyPolicy = () => {
  const [contentfulAppConfigQueryRef, loadContentfulAppConfig] = useQueryLoader<configContentfulAppConfigQuery>(
    configContentfulAppConfigQueryGraphql
  );

  useEffect(() => {
    loadContentfulAppConfig({});
  }, [loadContentfulAppConfig]);

  const fallback = null;
  if (!contentfulAppConfigQueryRef) {
    return fallback;
  }

  return (
    <Suspense fallback={fallback}>
      <PrivacyPolicyContent contentfulAppConfigQueryRef={contentfulAppConfigQueryRef} />
    </Suspense>
  );
};
