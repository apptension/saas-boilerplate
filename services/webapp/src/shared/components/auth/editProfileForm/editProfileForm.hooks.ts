import { useIntl } from 'react-intl';

import authUpdateUserProfileMutationGraphql, {
  authUpdateUserProfileMutation,
} from '../../../../modules/auth/__generated__/authUpdateUserProfileMutation.graphql';
import { useApiForm } from '../../../hooks/useApiForm';
import { useAuth } from '../../../hooks/useAuth/useAuth';
import { usePromiseMutation } from '../../../services/graphqlApi/usePromiseMutation';
import { useSnackbar } from '../../../../modules/snackbar';
import { UpdateProfileFormFields } from './editProfileForm.types';

export const useEditProfileForm = () => {
  const intl = useIntl();
  const { currentUser } = useAuth();
  const snackbar = useSnackbar();
  const form = useApiForm<UpdateProfileFormFields>({
    defaultValues: {
      firstName: currentUser?.firstName ?? '',
      lastName: currentUser?.lastName ?? '',
    },
  });

  const { handleSubmit, setGraphQLResponseErrors } = form;

  const [commitUpdateUserMutation] = usePromiseMutation<authUpdateUserProfileMutation>(
    authUpdateUserProfileMutationGraphql
  );

  const handleUpdate = handleSubmit(async (input: UpdateProfileFormFields) => {
    try {
      const { errors } = await commitUpdateUserMutation({
        variables: {
          input,
        },
      });
      if (errors) {
        setGraphQLResponseErrors(errors);
      } else {
        snackbar.showMessage(
          intl.formatMessage({
            defaultMessage: 'Personal data successfully changed.',
            id: 'Auth / Update profile/ Success message',
          })
        );
      }
    } catch {}
  });

  return { ...form, handleUpdate };
};
