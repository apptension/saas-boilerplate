import React from 'react';
import { useSelector } from 'react-redux';
import { MarkdownPage } from '../../shared/components/markdownPage';
import { selectPrivacyPolicy } from '../../modules/config/config.selectors';

export const PrivacyPolicy = () => {
  const privacyPolicyMarkdown = useSelector(selectPrivacyPolicy);
  return <MarkdownPage markdown={privacyPolicyMarkdown} />;
};
