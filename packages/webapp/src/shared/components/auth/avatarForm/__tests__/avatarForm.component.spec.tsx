import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { times } from 'ramda';

import { currentUserFactory } from '../../../../../mocks/factories';
import { Role } from '../../../../../modules/auth/auth.types';
import { snackbarActions } from '../../../../../modules/snackbar';
import { composeMockedQueryResult } from '../../../../../tests/utils/fixtures';
import { render } from '../../../../../tests/utils/rendering';
import { fillCommonQueryWithUser } from '../../../../utils/commonQuery';
import { authUpdateUserProfileMutation } from '../../editProfileForm/editProfileForm.graphql';
import { AvatarForm } from '../avatarForm.component';
import { MAX_AVATAR_SIZE } from '../avatarForm.constants';

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

  const createImageFile = (content: string) => new File([content], 'file.png', { type: 'image/png' });
  const fireAvatarChange = async (file = createImageFile('content')) => {
    await userEvent.upload(await screen.findByTestId('file-input'), file);
    return file;
  };

  it('should call changeAvatar when file changed and show success message', async () => {
    const currentUser = currentUserFactory({
      id: '1',
      firstName: 'Jack',
      lastName: 'White',
      email: 'jack.white@mail.com',
      roles: [Role.ADMIN, Role.USER],
      avatar: null,
    });
    const file = createImageFile('content');
    const avatarUrl = 'avatar-url';
    const { waitForApolloMocks } = render(<AvatarForm />, {
      apolloMocks: () => {
        return [
          fillCommonQueryWithUser(currentUser),
          composeMockedQueryResult(authUpdateUserProfileMutation, {
            variables: {
              input: {
                avatar: file,
              },
            },
            data: {
              updateCurrentUser: {
                userProfile: {
                  __typename: 'UserProfileType',
                  id: '1',
                  user: {
                    ...currentUser,
                    __typename: 'CurrentUserType',
                    firstName: 'test',
                    avatar: avatarUrl,
                  },
                },
              },
            },
          }),
        ];
      },
    });

    await fireAvatarChange(file);
    await waitForApolloMocks();

    await waitFor(async () => {
      const image = await screen.findByAltText('user avatar');
      expect(image.src).toContain(avatarUrl);
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      snackbarActions.showMessage({
        text: 'Avatar successfully changed.',
        id: 1,
      })
    );
  });

  it('should show error message if file size exceeds maximum size', async () => {
    render(<AvatarForm />);

    const file = createImageFile(times(() => 'x', MAX_AVATAR_SIZE + 100).join(''));
    await fireAvatarChange(file);

    const sizeInMegabytes = MAX_AVATAR_SIZE / (1024 * 1024);
    expect(await screen.findByText(`File cannot be larger than ${sizeInMegabytes} MB`)).toBeInTheDocument();
  });
});
