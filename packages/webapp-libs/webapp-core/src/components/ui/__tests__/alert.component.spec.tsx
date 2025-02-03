import { screen } from '@testing-library/react';

import { render } from '../../../tests/utils/rendering';
import { Alert, AlertDescription, AlertTitle } from '../alert';

describe('UI/Alert: Component', () => {
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
