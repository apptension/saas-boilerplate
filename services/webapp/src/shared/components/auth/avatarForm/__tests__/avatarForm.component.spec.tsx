import { fireEvent, screen, waitFor } from '@testing-library/react';
import { times } from 'ramda';
import { AvatarForm } from '../avatarForm.component';
import { makeContextRenderer } from '../../../../utils/testUtils';
import { updateAvatar } from '../../../../../modules/auth/auth.actions';
import { snackbarActions } from '../../../../../modules/snackbar';
import { MAX_AVATAR_SIZE } from '../avatarForm.constants';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('AvatarForm: Component', () => {
  const component = () => <AvatarForm />;
  const render = makeContextRenderer(component);

  const createImageFile = (content: string) => new File([content], 'file.png', { type: 'image/png' });
  const fireAvatarChange = (file = createImageFile('content')) => {
    fireEvent.change(screen.getByTestId('file-input'), {
      target: { files: [file] },
    });
    return file;
  };

  it('should call changeAvatar when file changed', async () => {
    render();

    const file = fireAvatarChange();

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        updateAvatar({
          avatar: file,
        })
      );
    });
  });

  it('should show success message', async () => {
    mockDispatch.mockResolvedValue({ isError: false });
    render();

    fireAvatarChange();

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(snackbarActions.showMessage('Avatar successfully changed.'));
    });
  });

  it('should show error message if file size exceeds maximum size', async () => {
    render();

    const file = createImageFile(times(() => 'x', MAX_AVATAR_SIZE + 100).join(''));
    fireAvatarChange(file);

    const sizeInMegabytes = MAX_AVATAR_SIZE / (1024 * 1024);
    expect(await screen.findByText(`File cannot be larger than ${sizeInMegabytes} MB`)).toBeInTheDocument();
  });
});
