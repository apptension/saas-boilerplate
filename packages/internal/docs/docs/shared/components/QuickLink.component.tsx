import React from 'react';

interface QuickLinkProps {
  title: string;
  description?: string;
  to: string;
  icon?: React.ReactNode;
}

const QuickLink: React.FC<QuickLinkProps> = ({ title, description, to, icon }) => {
  return (
    <a href={to} className="quick-link">
      {icon && <span className="quick-link__icon">{icon}</span>}
      <div className="quick-link__content">
        <span className="quick-link__title">{title}</span>
        {description && <span className="quick-link__description">{description}</span>}
      </div>
      <svg
        className="quick-link__arrow"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4.16663 10H15.8333M15.8333 10L10 4.16667M15.8333 10L10 15.8333"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
};

export default QuickLink;


