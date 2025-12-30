import { useMutation } from '@apollo/client/react';
import { useApiForm } from '@sb/webapp-api-client/hooks';
import { useCommonQuery } from '@sb/webapp-api-client/providers';
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
  const { reload: reloadCommonQuery } = useCommonQuery();

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

  const [commitAvatarMutation] = useMutation(authUpdateUserProfileMutation, {
    onCompleted: () => {
      trackEvent('profile', 'avatar-update');

      reset();
      reloadCommonQuery(); // Reload to update avatar in Avatar component

      toast({
        description: intl.formatMessage({
          defaultMessage: 'Avatar successfully changed.',
          id: 'Auth / Avatar Form / Success message',
        }),
        variant: 'success',
      });
    },
    onError: (error: any) => {
      if (error?.graphQLErrors) {
        setApolloGraphQLResponseErrors(error.graphQLErrors);
      }
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

  return { ...form, handleAvatarUpload, fileTooLargeMessage };
};
