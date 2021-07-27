import { screen } from '@testing-library/react';
import { makeContextRenderer } from '../../../../utils/testUtils';
import { FormattedDate, FormattedDateProps } from '../formattedDate.component';

describe('FormattedDate: Component', () => {
  const defaultProps: FormattedDateProps = {
    value: '2010-10-10',
  };

  const component = (props: Partial<FormattedDateProps>) => <FormattedDate {...defaultProps} {...props} />;
  const render = makeContextRenderer(component);

  it('should properly format string date', () => {
    render();
    expect(screen.getByText('October 10, 2010')).toBeInTheDocument();
  });

  it('should properly format object date', () => {
    render({ value: new Date('2010-10-10') });
    expect(screen.getByText('October 10, 2010')).toBeInTheDocument();
  });
});
