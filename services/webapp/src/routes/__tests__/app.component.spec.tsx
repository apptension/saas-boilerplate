import { screen } from '@testing-library/react';
import { makeContextRenderer, PLACEHOLDER_CONTENT } from '../../shared/utils/testUtils';
import { AppComponent, AppComponentProps } from '../app.component';

const defaultProps: AppComponentProps = {
  children: PLACEHOLDER_CONTENT,
};

describe('App: Component', () => {
  const component = (props: Partial<AppComponentProps>) => <AppComponent {...defaultProps} {...props} />;
  const render = makeContextRenderer(component);

  it('should render App when language is set', () => {
    render({ children: <span data-testid="content" /> }, { router: { url: '/en' } });
    expect(screen.queryByTestId('content')).toBeInTheDocument();
  });

  it('should render nothing when language is not set', () => {
    render({ children: <span data-testid="content" /> }, { router: { url: '/' } });
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });
});
