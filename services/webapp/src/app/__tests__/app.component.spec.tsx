import { screen } from '@testing-library/react';
import { makeContextRenderer, PLACEHOLDER_CONTENT } from '../../shared/utils/testUtils';
import { ValidRoutesProviders, ValidRoutesProvidersProps } from '../providers/validRoutesProvider/validRoutesProviders';

const defaultProps: ValidRoutesProvidersProps = {
  children: PLACEHOLDER_CONTENT,
};

describe('App: Component', () => {
  const component = (props: Partial<ValidRoutesProvidersProps>) => (
    <ValidRoutesProviders {...defaultProps} {...props} />
  );
  const render = makeContextRenderer(component);

  it('should render App when language is set', () => {
    render({ children: <span data-testid="content" /> }, { router: { url: '/en' } });
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should render nothing when language is not set', () => {
    render({ children: <span data-testid="content" /> }, { router: { url: '/' } });
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });
});
