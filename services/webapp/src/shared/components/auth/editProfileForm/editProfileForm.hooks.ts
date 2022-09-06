import { useIntl } from 'react-intl';

import { useApiForm } from '../../../hooks/useApiForm';
import { useAuth } from '../../../hooks/useAuth/useAuth';
import { useSnackbar } from '../../snackbar';
import { usePromiseMutation } from '../../../services/graphqlApi/usePromiseMutation';
import AuthUpdateUserProfileMutation, {
  authUpdateUserProfileMutation,
} from '../../../../__generated__/authUpdateUserProfileMutation.graphql';
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

  const [commitUpdateUserMutation] = usePromiseMutation<authUpdateUserProfileMutation>(AuthUpdateUserProfileMutation);

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
            description: 'Auth / Update profile/ Success message',
          })
        );
      }
    } catch {}
  });

  return { ...form, handleUpdate };
};
