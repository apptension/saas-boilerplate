import { fireEvent, screen, waitFor } from '@testing-library/react';

import { render } from '../../../../tests/utils/rendering';
import { Dropzone, DropzoneProps } from '../dropzone.component';
import { ErrorCodes } from '../dropzone.types';

describe('Dropzone: Component', () => {
  const defaultProps: DropzoneProps = {};

  const Component = (props: Partial<DropzoneProps>) => <Dropzone {...defaultProps} {...props} />;

  const fireInputChange = async (files: File[]) => {
    fireEvent.change(await screen.findByTestId('file-input'), {
      target: { files },
    });
  };

  const file = new File(['content'], 'file.png', { type: 'image/png' });
  const secondFile = new File(['more-content'], 'second.png', { type: 'image/png' });

  it('should call onDrop', async () => {
    const onDrop = jest.fn();

    render(<Component onDrop={onDrop} />);

    fireInputChange([file]);

    const input = await screen.findByTestId('file-input');
    await waitFor(() => expect(input.val));

    expect(onDrop).toBeCalledTimes(1);
    expect(onDrop).toHaveBeenCalledWith([file], [], expect.anything());
  });

  it('should call onDrop with invalidated files and print toast message', async () => {
    const onDrop = jest.fn();

    render(<Component onDrop={onDrop} maxFiles={1} />);

    fireInputChange([file, secondFile]);

    const input = await screen.findByTestId('file-input');
    await waitFor(() => expect(input.val));

    expect(onDrop).toBeCalledTimes(1);
    expect(onDrop).toHaveBeenCalledWith(
      [],
      [file, secondFile].map((file) => ({
        errors: [
          {
            code: ErrorCodes.TOO_MANY_FILES,
            message: 'Too many files',
          },
        ],
        file,
      })),
      expect.anything()
    );

    const toast = await screen.findByTestId('toast-1');
    expect(toast).toHaveTextContent('Cannot accept more than 1 file');
  });
});
