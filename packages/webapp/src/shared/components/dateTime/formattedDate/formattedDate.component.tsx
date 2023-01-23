import { ComponentProps } from 'react';
import { FormattedDate as FormattedDateBase } from 'react-intl';

export type FormattedDateProps = ComponentProps<typeof FormattedDateBase>;

export const FormattedDate = (props: FormattedDateProps) => {
  return <FormattedDateBase year="numeric" month="long" day="2-digit" {...props} />;
};
