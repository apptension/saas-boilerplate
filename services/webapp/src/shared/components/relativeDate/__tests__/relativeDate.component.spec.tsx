import React from 'react';
import { screen } from '@testing-library/react';
import { makeContextRenderer } from '../../../utils/testUtils';
import { RelativeDate, RelativeDateProps } from '../relativeDate.component';
import { DAY, nowSub } from '../relativeDate.fixtures';

describe('RelativeDate: Component', () => {
  const defaultProps: RelativeDateProps = {
    date: new Date(),
  };

  const component = (props: Partial<RelativeDateProps>) => <RelativeDate {...defaultProps} {...props} />;
  const render = makeContextRenderer(component);

  it('should render formatted relative days', () => {
    const date = nowSub(DAY);
    render({
      date,
    });

    expect(screen.getByTitle(date.getFullYear(), { exact: false })).toBeInTheDocument();
    expect(screen.getByText('1 day ago')).toBeInTheDocument();
  });

  it('should render absolute date if more than week ago', () => {
    const date = nowSub(DAY * 8);
    render({
      date,
    });

    expect(screen.queryByText('7 days ago')).not.toBeInTheDocument();
    expect(screen.getByText(date.getFullYear(), { exact: false })).toBeInTheDocument();
  });
});
