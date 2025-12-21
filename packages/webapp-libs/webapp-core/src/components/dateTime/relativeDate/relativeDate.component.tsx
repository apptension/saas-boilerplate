import { HTMLAttributes, useMemo } from 'react';
import { FormattedMessage, FormattedRelativeTime, useIntl } from 'react-intl';

import { cn } from '../../../lib/utils';
import { SECOND_IN_MS, WEEK_IN_MS } from './relativeDate.constants';

export type RelativeDateProps = HTMLAttributes<HTMLTimeElement> & {
  date: Date;
};

/**
 * Check if a date is valid
 */
const isValidDate = (date: Date): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

export const RelativeDate = ({ date, className, ...restProps }: RelativeDateProps) => {
  const intl = useIntl();

  const isValid = isValidDate(date);

  const { value, isAboveWeek } = useMemo(() => {
    if (!isValid) {
      return { value: 0, isAboveWeek: false };
    }

    const to = new Date();
    const difference = date.getTime() - to.getTime();

    return {
      value: difference / SECOND_IN_MS,
      isAboveWeek: Math.abs(difference) > WEEK_IN_MS,
    };
  }, [date, isValid]);

  // Handle invalid dates gracefully
  if (!isValid) {
    return (
      <time className={cn('text-muted-foreground', className)} {...restProps}>
        <FormattedMessage defaultMessage="Unknown date" id="RelativeDate / Invalid date" />
      </time>
    );
  }

  const formattedTime = intl.formatTime(date);
  const formattedDate = intl.formatDate(date);

  const title = [formattedTime, formattedDate].join(' ');

  return (
    <time title={title} dateTime={date.toISOString()} className={className} {...restProps}>
      {isAboveWeek ? formattedDate : <FormattedRelativeTime value={value} updateIntervalInSeconds={1} />}
    </time>
  );
};
