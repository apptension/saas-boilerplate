import { HTMLAttributes, useMemo } from 'react';
import { FormattedRelativeTime, useIntl } from 'react-intl';

import { SECOND_IN_MS, WEEK_IN_MS } from './relativeDate.constants';

export type RelativeDateProps = HTMLAttributes<HTMLTimeElement> & {
  date: Date;
};

export const RelativeDate = ({ date, ...restProps }: RelativeDateProps) => {
  const intl = useIntl();

  const { value, isAboveWeek } = useMemo(() => {
    const to = new Date();
    const difference = date.getTime() - to.getTime();

    return {
      value: difference / SECOND_IN_MS,
      isAboveWeek: Math.abs(difference) > WEEK_IN_MS,
    };
  }, [date]);

  const formattedTime = intl.formatTime(date);
  const formattedDate = intl.formatDate(date);

  const title = [formattedTime, formattedDate].join(' ');

  return (
    <time title={title} dateTime={date.toISOString()} {...restProps}>
      {isAboveWeek ? formattedDate : <FormattedRelativeTime value={value} updateIntervalInSeconds={1} />}
    </time>
  );
};
