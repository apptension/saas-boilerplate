import React from 'react';

interface StepProps {
  number: number;
  title: string;
  children: React.ReactNode;
}

const Step: React.FC<StepProps> = ({ number, title, children }) => {
  return (
    <div className="step">
      <div className="step__header">
        <span className="step__number">{number}</span>
        <h4 className="step__title">{title}</h4>
      </div>
      <div className="step__content">{children}</div>
    </div>
  );
};

export default Step;



