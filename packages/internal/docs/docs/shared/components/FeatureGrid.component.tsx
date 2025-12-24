import React from 'react';

interface FeatureGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

const FeatureGrid: React.FC<FeatureGridProps> = ({ children, columns = 3 }) => {
  return (
    <div className={`feature-grid feature-grid--${columns}-cols`}>
      {children}
    </div>
  );
};

export default FeatureGrid;



