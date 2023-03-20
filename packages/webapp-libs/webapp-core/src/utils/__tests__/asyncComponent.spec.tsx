import { screen, waitFor } from '@testing-library/react';

import { render } from '../../tests/utils/rendering';
import { asyncComponent } from '../asyncComponent';

describe('asyncComponent', () => {
  test('should render the component wrapped in a Suspense component', async () => {
    const text = 'Component to load';

    const ComponentToLoad = () => <div>{text}</div>;

    const asyncLoader = jest.fn(() => Promise.resolve({ default: ComponentToLoad }));

    const AsyncComponent = asyncComponent(asyncLoader);

    render(<AsyncComponent />);

    await waitFor(() => {
      expect(asyncLoader).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText(text)).toBeInTheDocument();
  });
});
