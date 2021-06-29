import { FormattedDate } from 'react-intl';

export type DateProps = {
  value: Date | string;
};

export const DateDisplay = ({ value }: DateProps) => {
  return <FormattedDate value={value} year="numeric" month="long" day="2-digit" />;
};
