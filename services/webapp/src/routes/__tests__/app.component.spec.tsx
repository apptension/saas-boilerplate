import React from 'react';
import { makeContextRenderer, PLACEHOLDER_CONTENT } from '../../shared/utils/testUtils';
import { AppComponent, AppComponentProps } from '../app.component';

const defaultProps: AppComponentProps = {
  children: PLACEHOLDER_CONTENT,
};

describe('App: Component', () => {
  const component = (props: Partial<AppComponentProps>) => <AppComponent {...defaultProps} {...props} />;
  const render = makeContextRenderer(component);

  it('should render App when language is set', () => {
    const { container } = render();
    expect(container).toMatchSnapshot();
  });
});
