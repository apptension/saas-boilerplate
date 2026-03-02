/**
 * Jest mock for react-markdown (ESM-only package)
 * Returns a simple component that renders children as-is
 */
import React from 'react';

const ReactMarkdown: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div data-testid="react-markdown">{children}</div>;
};

export default ReactMarkdown;
