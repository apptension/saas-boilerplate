import { screen } from '@testing-library/react';

import { render } from '../../../tests/utils/rendering';
import { FileSize, FileSizeProps } from '../fileSize.component';

describe('FileSize: Component', () => {
  const defaultProps: FileSizeProps = {
    size: 1,
  };

  const Component = (props: Partial<FileSizeProps>) => <FileSize {...defaultProps} {...props} />;

  it('should render bytes', async () => {
    render(<Component size={1000} />);

    expect(await screen.findByText('1000 bytes')).toBeInTheDocument();
  });

  it('should render kiloBytes', async () => {
    render(<Component size={1024} />);

    expect(await screen.findByText('1 KB')).toBeInTheDocument();
  });

  it('should render no decimals', async () => {
    render(<Component size={1200} decimals={0} />);

    expect(await screen.findByText('1 KB')).toBeInTheDocument();
  });
});
