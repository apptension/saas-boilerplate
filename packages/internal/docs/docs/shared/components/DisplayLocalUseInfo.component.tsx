import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import MDXContent from '@theme/MDXContent';

const DisplayLocalUseInfo = ({ children }) => {
  const {
    siteConfig: {
      customFields: { displayLocalUseInfo = false },
    },
  } = useDocusaurusContext();

  return displayLocalUseInfo ? <MDXContent>{children}</MDXContent> : null;
};

export default DisplayLocalUseInfo;
