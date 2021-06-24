import React from 'react';
import { screen } from '@testing-library/react';
import { makeContextRenderer } from '../../../utils/testUtils';
import { DateDisplay, DateProps } from '../date.component';

describe('Date: Component', () => {
  const defaultProps: DateProps = {
    value: '2010-10-10',
  };

  const component = (props: Partial<DateProps>) => <DateDisplay {...defaultProps} {...props} />;
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
