import { screen } from '@testing-library/react';

import { render } from '../../../tests/utils/rendering';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../table';

describe('UI/Table: component', () => {
  const captionContent = 'Caption content';
  const headerContent = 'Header content';
  const cellContent = 'Cell content';
  const Component = () => (
    <Table>
      <TableCaption>{captionContent}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>{headerContent}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">{cellContent}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );

  it('should render all components', async () => {
    render(<Component />);

    expect(await screen.findByText(captionContent)).toBeInTheDocument();
    expect(await screen.findByText(headerContent)).toBeInTheDocument();
    expect(await screen.findByText(cellContent)).toBeInTheDocument();
  });
});
