import { useSelector } from 'react-redux';
import { selectTermsAndConditions } from '../../modules/config/config.selectors';
import { MarkdownPage } from '../../shared/components/markdownPage';

export const TermsAndConditions = () => {
  const privacyPolicyMarkdown = useSelector(selectTermsAndConditions);
  return <MarkdownPage markdown={privacyPolicyMarkdown} />;
};
