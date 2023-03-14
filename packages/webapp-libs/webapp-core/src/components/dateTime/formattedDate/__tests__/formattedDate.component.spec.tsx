import { screen } from '@testing-library/react';

import { render } from '../../../../tests/utils/rendering';
import { FormattedDate, FormattedDateProps } from '../formattedDate.component';

describe('FormattedDate: Component', () => {
  const defaultProps: FormattedDateProps = {
    value: '2010-10-10',
  };

  const Component = (props: Partial<FormattedDateProps>) => <FormattedDate {...defaultProps} {...props} />;

  it('should properly format string date', async () => {
    render(<Component />);
    expect(await screen.findByText('October 10, 2010')).toBeInTheDocument();
  });

  it('should properly format object date', async () => {
    render(<Component value={new Date('2010-10-10')} />);
    expect(await screen.findByText('October 10, 2010')).toBeInTheDocument();
  });
});
