import { ChevronLeft } from 'lucide-react';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { ButtonVariant } from '../';
import { cn } from '../../../lib/utils';
import { Link } from '../link';

export type BackButtonProps = {
  to?: string;
  children?: ReactNode;
  className?: string;
};

export const BackButton = ({ to, children, className }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (to) return;
    navigate(-1);
  };

  return (
    <Link
      to={to}
      onClick={handleBackClick}
      icon={<ChevronLeft size={16} />}
      variant={ButtonVariant.GHOST}
      className={cn(className, 'cursor-pointer')}
    >
      {children ?? <FormattedMessage defaultMessage="Go back" id="Back Button / Go back" />}
    </Link>
  );
};
