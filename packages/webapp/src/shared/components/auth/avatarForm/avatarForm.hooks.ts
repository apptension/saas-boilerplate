import { useMutation } from '@apollo/client/react';
import { extractGraphQLErrors } from '@sb/webapp-api-client/api';
import { useApiForm } from '@sb/webapp-api-client/hooks';
import { useFormatFileSize } from '@sb/webapp-core/components/fileSize';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { useIntl } from 'react-intl';

import { authUpdateUserProfileMutation } from '../editProfileForm/editProfileForm.graphql';
import { MAX_AVATAR_SIZE } from './avatarForm.constants';
import { UpdateAvatarFormFields } from './avatarForm.types';

export const useAvatarForm = () => {
  const intl = useIntl();
  const formatFileSize = useFormatFileSize();
  const { toast } = useToast();

  const fileTooLargeMessage = intl.formatMessage(
    {
      defaultMessage: 'File cannot be larger than {size}',
      id: 'Auth / Avatar Form / Error / Too large',
    },
    {
      size: formatFileSize(MAX_AVATAR_SIZE),
    }
  );

  const form = useApiForm<UpdateAvatarFormFields>({
    defaultValues: {
      avatar: null,
    },
    errorMessages: {
      avatar: {
        too_large: fileTooLargeMessage,
      },
    },
  });

  const {
    handleSubmit,
    setApolloGraphQLResponseErrors,
    form: { reset },
  } = form;

  const [commitAvatarMutation, { loading }] = useMutation(authUpdateUserProfileMutation, {
    // The mutation returns commonQueryCurrentUserFragment which includes the avatar field
    // Apollo automatically updates the cache when the mutation response includes matching fragments
    onCompleted: () => {
      trackEvent('profile', 'avatar-update');
      reset();

      toast({
        description: intl.formatMessage({
          defaultMessage: 'Avatar successfully changed.',
          id: 'Auth / Avatar Form / Success message',
        }),
        variant: 'success',
      });
    },
    onError: (error) => {
      const graphQLErrors = extractGraphQLErrors(error);
      if (graphQLErrors) {
        setApolloGraphQLResponseErrors(graphQLErrors);
      }
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Failed to update avatar. Please try again.',
          id: 'Auth / Avatar Form / Error message',
        }),
        variant: 'destructive',
      });
    },
  });

  const handleAvatarUpload = handleSubmit(async (data: UpdateAvatarFormFields) => {
    if (!data.avatar?.[0]) return;
    await commitAvatarMutation({
      variables: {
        input: {
          avatar: data.avatar?.[0],
        },
      },
    });
  });

  return { ...form, handleAvatarUpload, fileTooLargeMessage, loading };
};
