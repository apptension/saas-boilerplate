import { useIntl } from 'react-intl';

import { useFormatFileSize } from '../../fileSize';
import { useApiForm } from '../../../hooks/useApiForm';
import { usePromiseMutation } from '../../../services/graphqlApi/usePromiseMutation';
import authUpdateUserProfileMutationGraphql, {
  authUpdateUserProfileMutation,
} from '../../../../modules/auth/__generated__/authUpdateUserProfileMutation.graphql';
import { useSnackbar } from '../../../../modules/snackbar';
import { MAX_AVATAR_SIZE } from './avatarForm.constants';
import { UpdateAvatarFormFields } from './avatarForm.types';

export const useAvatarForm = () => {
  const intl = useIntl();
  const formatFileSize = useFormatFileSize();
  const snackbar = useSnackbar();

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
    setGraphQLResponseErrors,
    form: { reset },
  } = form;

  const [commitAvatarMutation] = usePromiseMutation<authUpdateUserProfileMutation>(
    authUpdateUserProfileMutationGraphql
  );

  const handleAvatarUpload = handleSubmit(async (data: UpdateAvatarFormFields) => {
    try {
      if (!data.avatar?.[0]) return;
      const { errors } = await commitAvatarMutation({
        variables: {
          input: {},
        },
        uploadables: { avatar: data.avatar?.[0] },
      });

      if (errors) {
        setGraphQLResponseErrors(errors);
      } else {
        reset();
        snackbar.showMessage(
          intl.formatMessage({
            defaultMessage: 'Avatar successfully changed.',
            id: 'Auth / Avatar Form / Success message',
          })
        );
      }
    } catch {}
  });

  return { ...form, handleAvatarUpload, fileTooLargeMessage };
};

