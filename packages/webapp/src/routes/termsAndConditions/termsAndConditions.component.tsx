import { FunctionComponent, Suspense, useEffect } from 'react';
import { PreloadedQuery, usePreloadedQuery, useQueryLoader } from 'react-relay';

import { MarkdownPage } from '../../shared/components/markdownPage';
import configContentfulAppConfigQueryGraphql, {
  configContentfulAppConfigQuery,
} from '../../modules/config/__generated__/configContentfulAppConfigQuery.graphql';

type TermsAndConditionsContentProps = {
  contentfulAppConfigQueryRef: PreloadedQuery<configContentfulAppConfigQuery>;
};

export const TermsAndConditionsContent: FunctionComponent<TermsAndConditionsContentProps> = ({
  contentfulAppConfigQueryRef,
}) => {
  const { appConfigCollection } = usePreloadedQuery(configContentfulAppConfigQueryGraphql, contentfulAppConfigQueryRef);
  return <MarkdownPage markdown={appConfigCollection?.items?.[0]?.termsAndConditions} />;
};

export const TermsAndConditions = () => {
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
      <TermsAndConditionsContent contentfulAppConfigQueryRef={contentfulAppConfigQueryRef} />
    </Suspense>
  );
};
