import React from 'react';

interface StepsProps {
  children: React.ReactNode;
}

const Steps: React.FC<StepsProps> = ({ children }) => {
  return <div className="steps">{children}</div>;
};

export default Steps;


