import { screen } from '@testing-library/react';
import { render, PLACEHOLDER_CONTENT, PLACEHOLDER_TEST_ID } from '../../../../tests/utils/rendering';

import { EmptyState, EmptyStateProps } from '../emptyState.component';

describe('EmptyState: Component', () => {
  const defaultProps: EmptyStateProps = {};

  const Component = (props: Partial<EmptyStateProps>) => <EmptyState {...defaultProps} {...props} />;

  it('should render passed children', () => {
    render(<Component>{PLACEHOLDER_CONTENT}</Component>);

    expect(screen.getByTestId(PLACEHOLDER_TEST_ID)).toBeInTheDocument();
  });
});
