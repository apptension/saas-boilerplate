import { screen } from '@testing-library/react';
import { makeContextRenderer, PLACEHOLDER_CONTENT, PLACEHOLDER_TEST_ID } from '../../../utils/testUtils';
import { EmptyState, EmptyStateProps } from '../emptyState.component';

describe('EmptyState: Component', () => {
  const defaultProps: EmptyStateProps = {};

  const component = (props: Partial<EmptyStateProps>) => <EmptyState {...defaultProps} {...props} />;
  const render = makeContextRenderer(component);

  it('should render passed children', () => {
    render({
      children: PLACEHOLDER_CONTENT,
    });

    expect(screen.getByTestId(PLACEHOLDER_TEST_ID)).toBeInTheDocument();
  });
});
