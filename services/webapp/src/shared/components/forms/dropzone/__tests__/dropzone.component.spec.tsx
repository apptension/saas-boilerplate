import { fireEvent, screen, waitFor } from '@testing-library/react';
import { makeContextRenderer } from '../../../../utils/testUtils';
import { Dropzone, DropzoneProps } from '../dropzone.component';
import { ErrorCodes } from '../dropzone.types';
import { snackbarActions } from '../../../../../modules/snackbar';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('Dropzone: Component', () => {
  const defaultProps: DropzoneProps = {};

  const component = (props: Partial<DropzoneProps>) => <Dropzone {...defaultProps} {...props} />;
  const render = makeContextRenderer(component);

  const fireInputChange = async (files: File[]) => {
    await waitFor(() =>
      fireEvent.change(screen.getByTestId('file-input'), {
        target: { files },
      })
    );
  };

  const file = new File(['content'], 'file.png', { type: 'image/png' });
  const secondFile = new File(['more-content'], 'second.png', { type: 'image/png' });

  it('should call onDrop', async () => {
    const onDrop = jest.fn();
    render({
      onDrop,
    });

    await fireInputChange([file]);

    expect(onDrop).toBeCalledTimes(1);
    expect(onDrop).toHaveBeenCalledWith([file], [], expect.anything());
  });

  it('should call onDrop with invalidated files and print snackbar message', async () => {
    const onDrop = jest.fn();
    render({
      onDrop,
      maxFiles: 1,
    });

    await fireInputChange([file, secondFile]);

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

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(snackbarActions.showMessage(expect.anything()));
    });
  });
});
