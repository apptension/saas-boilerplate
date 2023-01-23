import { act, screen, waitFor } from '@testing-library/react';
import { times } from 'ramda';
import userEvent from '@testing-library/user-event';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

import { AvatarForm } from '../avatarForm.component';
import { snackbarActions } from '../../../../../modules/snackbar';
import { MAX_AVATAR_SIZE } from '../avatarForm.constants';
import { fillCommonQueryWithUser } from '../../../../utils/commonQuery';
import { render } from '../../../../../tests/utils/rendering';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('AvatarForm: Component', () => {
  beforeEach(() => {
    mockDispatch.mockReset();
  });

  const renderComponent = () => {
    const relayEnvironment = createMockEnvironment();
    fillCommonQueryWithUser(relayEnvironment);

    return {
      ...render(<AvatarForm />, { relayEnvironment }),
      relayEnvironment,
    };
  };

  const createImageFile = (content: string) => new File([content], 'file.png', { type: 'image/png' });
  const fireAvatarChange = async (file = createImageFile('content')) => {
    await userEvent.upload(screen.getByTestId('file-input'), file);
    return file;
  };

  it('should call changeAvatar when file changed', async () => {
    const { relayEnvironment } = renderComponent();

    await fireAvatarChange();

    expect(relayEnvironment).toHaveLatestOperation('authUpdateUserProfileMutation');
    expect(relayEnvironment).toLatestOperationInputEqual({});
  });

  it('should show success message', async () => {
    const { relayEnvironment } = renderComponent();
    await fireAvatarChange();

    await act(async () => {
      const operation = relayEnvironment.mock.getMostRecentOperation();
      relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
    });

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        snackbarActions.showMessage({
          text: 'Avatar successfully changed.',
          id: 1,
        })
      );
    });
  });

  it('should show error message if file size exceeds maximum size', async () => {
    const { relayEnvironment } = renderComponent();

    const file = createImageFile(times(() => 'x', MAX_AVATAR_SIZE + 100).join(''));
    await fireAvatarChange(file);

    const sizeInMegabytes = MAX_AVATAR_SIZE / (1024 * 1024);
    expect(await screen.findByText(`File cannot be larger than ${sizeInMegabytes} MB`)).toBeInTheDocument();
    expect(relayEnvironment).not.toHaveLatestOperation('authUpdateUserProfileMutation');
  });
});
