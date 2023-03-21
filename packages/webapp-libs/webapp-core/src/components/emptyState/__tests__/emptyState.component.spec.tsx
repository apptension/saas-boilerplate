import { screen } from '@testing-library/react';

import { PLACEHOLDER_CONTENT, PLACEHOLDER_TEST_ID, render } from '../../../tests/utils/rendering';
import { EmptyState, EmptyStateProps } from '../emptyState.component';

describe('EmptyState: Component', () => {
  const defaultProps: EmptyStateProps = {};

  const Component = (props: Partial<EmptyStateProps>) => <EmptyState {...defaultProps} {...props} />;

  it('should render passed children', async () => {
    render(<Component>{PLACEHOLDER_CONTENT}</Component>);

    expect(await screen.findByTestId(PLACEHOLDER_TEST_ID)).toBeInTheDocument();
  });
});
