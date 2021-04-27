import React from 'react';
import { screen } from '@testing-library/react';
import { Home } from '../home.component';
import { makeContextRenderer } from '../../../shared/utils/testUtils';

describe('Home: Component', () => {
  const component = () => <Home />;
  const render = makeContextRenderer(component);

  it('should display welcome message', () => {
    render();
    expect(screen.getByText('Welcome in the app!')).toBeInTheDocument();
  });
});
