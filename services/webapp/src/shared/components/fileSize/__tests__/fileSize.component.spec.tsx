import { screen } from '@testing-library/react';
import { makeContextRenderer } from '../../../utils/testUtils';
import { FileSize, FileSizeProps } from '../fileSize.component';

describe('FileSize: Component', () => {
  const defaultProps: FileSizeProps = {
    size: 1,
  };

  const component = (props: Partial<FileSizeProps>) => <FileSize {...defaultProps} {...props} />;
  const render = makeContextRenderer(component);

  it('should render bytes', () => {
    render({
      size: 1000,
    });

    expect(screen.getByText('1000 bytes')).toBeInTheDocument();
  });

  it('should render kiloBytes', () => {
    render({
      size: 1024,
    });

    expect(screen.getByText('1 KB')).toBeInTheDocument();
  });

  it('should render no decimals', () => {
    render({
      size: 1200,
      decimals: 0,
    });

    expect(screen.getByText('1 KB')).toBeInTheDocument();
  });
});
