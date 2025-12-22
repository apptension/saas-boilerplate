import React from 'react';

interface TechItem {
  name: string;
  icon?: string;
  description?: string;
}

interface TechStackProps {
  items: TechItem[];
}

const TechStack: React.FC<TechStackProps> = ({ items }) => {
  return (
    <div className="tech-stack">
      {items.map((item, index) => (
        <div key={index} className="tech-stack__item">
          {item.icon && <span className="tech-stack__icon">{item.icon}</span>}
          <span className="tech-stack__name">{item.name}</span>
          {item.description && <span className="tech-stack__description">{item.description}</span>}
        </div>
      ))}
    </div>
  );
};

export default TechStack;

