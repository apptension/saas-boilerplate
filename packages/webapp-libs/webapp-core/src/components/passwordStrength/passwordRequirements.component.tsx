import { Check, Circle } from 'lucide-react';
import { useIntl } from 'react-intl';

import { cn } from '../../lib/utils';
import { validatePassword } from './passwordStrength.utils';

export interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

interface RequirementItemProps {
  met: boolean;
  label: string;
  hasInput: boolean;
}

const RequirementItem = ({ met, label, hasInput }: RequirementItemProps) => {
  // When there's no input, show neutral state (not met, not failed)
  const showMet = hasInput && met;
  const showPending = !hasInput;

  return (
    <li className="flex items-center gap-2 text-xs">
      <span
        className={cn('flex-shrink-0', {
          'text-green-500': showMet,
          'text-muted-foreground/40': showPending,
          'text-muted-foreground/60': hasInput && !met,
        })}
      >
        {showMet ? <Check className="h-3 w-3" /> : <Circle className="h-2 w-2" />}
      </span>
      <span
        className={cn('text-muted-foreground', {
          'line-through opacity-50': showMet,
        })}
      >
        {label}
      </span>
    </li>
  );
};

export const PasswordRequirements = ({ password, className }: PasswordRequirementsProps) => {
  const intl = useIntl();
  const hasInput = password.length > 0;
  const validation = validatePassword(password);

  const requirements = [
    {
      key: 'minLength',
      met: validation.minLength,
      label: intl.formatMessage({
        defaultMessage: '8+ characters',
        id: 'Password Requirements / Min length',
      }),
    },
    {
      key: 'notCommon',
      met: validation.notCommon,
      label: intl.formatMessage({
        defaultMessage: 'Not a common password',
        id: 'Password Requirements / Not common',
      }),
    },
    {
      key: 'notNumericOnly',
      met: validation.notNumericOnly,
      label: intl.formatMessage({
        defaultMessage: 'Contains letters',
        id: 'Password Requirements / Not numeric only',
      }),
    },
  ];

  return (
    <ul className={cn('flex flex-wrap gap-x-4 gap-y-1', className)}>
      {requirements.map((req) => (
        <RequirementItem key={req.key} met={req.met} label={req.label} hasInput={hasInput} />
      ))}
    </ul>
  );
};
