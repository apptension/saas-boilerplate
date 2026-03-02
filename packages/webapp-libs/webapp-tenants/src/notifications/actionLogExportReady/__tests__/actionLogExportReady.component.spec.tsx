import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { render } from '../../../tests/utils/rendering';
import { ActionLogExportReady } from '../actionLogExportReady.component';

describe('ActionLogExportReady: Component', () => {
  const originalOpen = window.open;
  beforeEach(() => {
    window.open = jest.fn();
  });
  afterEach(() => {
    window.open = originalOpen;
  });

  it('should render title and content with tenant name', async () => {
    render(
      <ActionLogExportReady
        id="1"
        data={{
          export_id: 'export-1',
          tenant_name: 'Test Org',
          log_count: 5,
          file_size: 1024,
          download_url: 'https://example.com/download',
        }}
        readAt={null}
        createdAt="2024-01-01T00:00:00Z"
      />
    );

    expect(await screen.findByText(/activity log export ready/i)).toBeInTheDocument();
    expect(screen.getByText(/test org/i)).toBeInTheDocument();
  });

  it('should not render Download button when download_url is empty', async () => {
    render(
      <ActionLogExportReady
        id="1"
        data={{
          export_id: 'export-1',
          tenant_name: 'Test Org',
          log_count: 1,
          file_size: 512,
          download_url: '',
        }}
        readAt={null}
        createdAt="2024-01-01T00:00:00Z"
      />
    );

    expect(await screen.findByText(/activity log export ready/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /download/i })).not.toBeInTheDocument();
  });

  it('should open download URL when Download button is clicked', async () => {
    const downloadUrl = 'https://example.com/export.zip';
    render(
      <ActionLogExportReady
        id="1"
        data={{
          export_id: 'export-1',
          tenant_name: 'Test Org',
          log_count: 5,
          file_size: 1024,
          download_url: downloadUrl,
        }}
        readAt={null}
        createdAt="2024-01-01T00:00:00Z"
      />
    );

    const downloadButton = await screen.findByText('Download');
    await userEvent.click(downloadButton);
    expect(window.open).toHaveBeenCalledWith(downloadUrl, '_blank');
  });
});
