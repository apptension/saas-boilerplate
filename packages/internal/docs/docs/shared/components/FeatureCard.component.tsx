import React from 'react';

interface FeatureCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  link?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, link }) => {
  const cardContent = (
    <div className="feature-card">
      {icon && <div className="feature-card__icon">{icon}</div>}
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__description">{description}</p>
    </div>
  );

  if (link) {
    return <a href={link} className="feature-card__link">{cardContent}</a>;
  }

  return cardContent;
};

export default FeatureCard;

