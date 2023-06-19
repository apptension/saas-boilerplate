import { screen } from '@testing-library/react';

import { documentFactory } from '../../../../tests/factories';
import { render } from '../../../../tests/utils/rendering';
import { Document } from '../document.component';

describe('Document: Component', () => {
  it('should render file link', async () => {
    const { file, createdAt } = documentFactory();
    const id = 'file-1';
    const item = { file, createdAt, id };

    const { waitForApolloMocks } = render(<Document item={item} />);
    await waitForApolloMocks();

    const fileLink = await screen.findByRole('link', { name: file?.name ?? '' });
    expect(fileLink).toHaveAttribute('href', file?.url);
  });

  it('should render file link without href', async () => {
    const { file, createdAt } = documentFactory({
      file: {
        name: 'test.png',
        url: undefined,
      },
    });
    const id = 'file-1';
    const item = { file, createdAt, id };

    const { waitForApolloMocks } = render(<Document item={item} />);
    await waitForApolloMocks();

    const fileLink = screen.getByText(file?.name ?? '');
    expect(fileLink).not.toHaveAttribute('href');
  });

  it('should render file link with title', async () => {
    const { file, createdAt } = documentFactory({
      file: {
        name: 'test.png',
        url: undefined,
      },
    });
    const id = 'file-1';
    const item = { file, createdAt, id };

    const { waitForApolloMocks } = render(<Document item={item} />);
    await waitForApolloMocks();

    const fileLink = screen.getByText(file?.name ?? '');
    expect(fileLink).toHaveAttribute('title', file?.name);
  });
});
