import { screen } from '@testing-library/react';

import { render } from '../../../tests/utils/rendering';
import { ActionLogExportFailed } from '../actionLogExportFailed.component';

describe('ActionLogExportFailed: Component', () => {
  it('should render title and content with tenant name', async () => {
    render(
      <ActionLogExportFailed
        id="1"
        data={{
          export_id: 'export-1',
          tenant_name: 'Test Org',
          error: 'Export failed',
        }}
        readAt={null}
        createdAt="2024-01-01T00:00:00Z"
      />
    );

    expect(await screen.findByText(/activity log export failed/i)).toBeInTheDocument();
    expect(screen.getByText(/failed to export activity logs from "test org"/i)).toBeInTheDocument();
  });
});
