import { screen } from '@testing-library/react';
import React from 'react';

import { Alert, AlertDescription, AlertTitle } from '../';
import { render } from '../../../tests/utils/rendering';

describe('Alert: Component', () => {
  const title = 'Title';
  const content = 'Content';

  it('should render title and content', async () => {
    render(
      <Alert>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{content}</AlertDescription>
      </Alert>
    );

    expect(await screen.findByText(title)).toBeInTheDocument();
    expect(await screen.findByText(content)).toBeInTheDocument();
  });
});
