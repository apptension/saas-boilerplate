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
        ];
      },
    });

    await fireAvatarChange(file);
    // Wait for mutation mock (index 1, after CommonQuery at index 0)
    await waitForApolloMocks(1); // Wait for mutation

    // Wait for toast to confirm mutation completed
    const toast = await screen.findByTestId('toast-1', {}, { timeout: 3000 });
    expect(toast).toHaveTextContent('Avatar successfully changed.');
    expect(trackEvent).toHaveBeenCalledWith('profile', 'avatar-update');

    // Note: Apollo cache update behavior isn't reliably testable with MockedProvider
    // The mutation success is verified by the toast message and trackEvent call above
  });

  it('should show error toast if file size exceeds maximum size', async () => {
    render(<AvatarForm />);

    const file = createImageFile(times(() => 'x', MAX_AVATAR_SIZE + 100).join(''));
    await fireAvatarChange(file);

    const sizeInMegabytes = MAX_AVATAR_SIZE / (1024 * 1024);
    // Error should now be shown as a toast notification
    const toast = await screen.findByTestId('toast-1', {}, { timeout: 3000 });
    expect(toast).toHaveTextContent(`File cannot be larger than ${sizeInMegabytes} MB`);
  });

  it('should show loading spinner while uploading avatar', async () => {
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
          {
            ...composeMockedQueryResult(authUpdateUserProfileMutation, {
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
            delay: 100, // Add delay to capture loading state
          },
        ];
      },
    });

    await fireAvatarChange(file);

    // Loading spinner should be visible
    const loadingSpinner = await screen.findByTestId('avatar-loading', {}, { timeout: 1000 });
    expect(loadingSpinner).toBeInTheDocument();

    // Wait for mutation to complete
    await waitForApolloMocks(1);

    // Loading spinner should disappear after upload completes
    await waitFor(() => {
      expect(screen.queryByTestId('avatar-loading')).not.toBeInTheDocument();
    });
  });


  it('should have accessible change photo button', async () => {
    render(<AvatarForm />);

    const button = await screen.findByRole('button', { name: /change profile photo/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });
});
