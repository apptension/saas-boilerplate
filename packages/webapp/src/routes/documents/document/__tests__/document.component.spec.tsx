import { screen } from '@testing-library/react';
import { createMockEnvironment } from 'relay-test-utils';

import { render } from '../../../../tests/utils/rendering';
import { documentFactory } from '../../../../mocks/factories';
import { fillCommonQueryWithUser } from '../../../../shared/utils/commonQuery';
import { Document } from '../document.component';

describe('Document: Component', () => {
  it('should render file link', async () => {
    const { file, createdAt } = documentFactory();
    const id = 'file-1';
    const item = { file, createdAt, id };

    const relayEnvironment = createMockEnvironment();
    fillCommonQueryWithUser(relayEnvironment);
    render(<Document item={item} />, { relayEnvironment });

    const fileLink = await screen.findByRole('link', { name: file?.name ?? '' });
    expect(fileLink).toHaveAttribute('href', file?.url);
  });
});
