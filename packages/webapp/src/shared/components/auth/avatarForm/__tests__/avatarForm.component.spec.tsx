import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils/fixtures';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { times } from 'ramda';

import { Role } from '../../../../../modules/auth/auth.types';
import { render } from '../../../../../tests/utils/rendering';
import { authUpdateUserProfileMutation } from '../../editProfileForm/editProfileForm.graphql';
import { AvatarForm } from '../avatarForm.component';
import { MAX_AVATAR_SIZE } from '../avatarForm.constants';

jest.mock('@sb/webapp-core/services/analytics');

describe('AvatarForm: Component', () => {
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
    const updatedUser = {
      ...currentUser,
      avatar: avatarUrl,
    };
    const { waitForApolloMocks } = render(<AvatarForm />, {
      apolloMocks: (defaultMocks) => {
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
                    ...updatedUser,
                    __typename: 'CurrentUserType',
                  },
                },
              },
            },
          }),
          fillCommonQueryWithUser(updatedUser), // Refresh query after mutation
        ];
      },
    });

    await fireAvatarChange(file);
    // Wait for mutation mock (index 1, after CommonQuery at index 0)
    await waitForApolloMocks(1); // Wait for mutation
    
    // Wait for refresh query (index 2) - reloadCommonQuery() triggers refetch which matches refresh query mock
    await waitForApolloMocks(2); // Wait for refresh query

    // Wait for toast first to confirm mutation completed
    const toast = await screen.findByTestId('toast-1', {}, { timeout: 3000 });
    expect(toast).toHaveTextContent('Avatar successfully changed.');
    expect(trackEvent).toHaveBeenCalledWith('profile', 'avatar-update');

    // Wait for image to appear with new avatar URL after refresh
    // The Avatar component re-renders after CommonQuery refreshes with updated user data
    // Radix UI Avatar.Image renders an <img> tag, so we can query by role
    const image = await screen.findByRole('img', { name: /user avatar/i }, { timeout: 3000 });
    expect(image).toHaveAttribute('src', avatarUrl);
  });

  it('should show error message if file size exceeds maximum size', async () => {
    render(<AvatarForm />);

    const file = createImageFile(times(() => 'x', MAX_AVATAR_SIZE + 100).join(''));
    await fireAvatarChange(file);

    const sizeInMegabytes = MAX_AVATAR_SIZE / (1024 * 1024);
    expect(await screen.findByText(`File cannot be larger than ${sizeInMegabytes} MB`)).toBeInTheDocument();
  });
});
