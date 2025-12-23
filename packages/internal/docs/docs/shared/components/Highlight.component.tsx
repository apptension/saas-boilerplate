import React from 'react';

interface HighlightProps {
  children: React.ReactNode;
  type?: 'primary' | 'success' | 'warning' | 'info';
}

const Highlight: React.FC<HighlightProps> = ({ children, type = 'primary' }) => {
  return <span className={`highlight highlight--${type}`}>{children}</span>;
};

export default Highlight;


