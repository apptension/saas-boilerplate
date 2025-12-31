import { useIntl } from 'react-intl';

import { cn } from '../../lib/utils';
import {
  calculateStrength,
  getStrengthColor,
  getStrengthPercentage,
  PasswordStrength,
} from './passwordStrength.utils';

export interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

const getStrengthLabel = (strength: PasswordStrength, intl: ReturnType<typeof useIntl>): string => {
  switch (strength) {
    case 'weak':
      return intl.formatMessage({
        defaultMessage: 'Weak',
        id: 'Password Strength / Weak',
      });
    case 'fair':
      return intl.formatMessage({
        defaultMessage: 'Fair',
        id: 'Password Strength / Fair',
      });
    case 'good':
      return intl.formatMessage({
        defaultMessage: 'Good',
        id: 'Password Strength / Good',
      });
    case 'strong':
      return intl.formatMessage({
        defaultMessage: 'Strong',
        id: 'Password Strength / Strong',
      });
  }
};

export const PasswordStrengthIndicator = ({ password, className }: PasswordStrengthIndicatorProps) => {
  const intl = useIntl();

  if (!password) {
    return null;
  }

  const strength = calculateStrength(password);
  const percentage = getStrengthPercentage(strength);
  const color = getStrengthColor(strength);
  const label = getStrengthLabel(strength, intl);

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {intl.formatMessage({
            defaultMessage: 'Password strength',
            id: 'Password Strength / Label',
          })}
        </span>
        <span
          className={cn('text-xs font-medium', {
            'text-destructive': strength === 'weak',
            'text-amber-600': strength === 'fair',
            'text-blue-600': strength === 'good',
            'text-green-600': strength === 'strong',
          })}
        >
          {label}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full transition-all duration-300', color)}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={intl.formatMessage(
            {
              defaultMessage: 'Password strength: {label}',
              id: 'Password Strength / Aria label',
            },
            { label }
          )}
        />
      </div>
    </div>
  );
};
