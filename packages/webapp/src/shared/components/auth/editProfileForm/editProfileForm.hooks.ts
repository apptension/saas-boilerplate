import { useMutation } from '@apollo/client';
import { useApiForm } from '@sb/webapp-api-client/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { useIntl } from 'react-intl';

import { useAuth } from '../../../hooks';
import { authUpdateUserProfileMutation } from './editProfileForm.graphql';
import { UpdateProfileFormFields } from './editProfileForm.types';

export const useEditProfileForm = () => {
  const intl = useIntl();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const form = useApiForm<UpdateProfileFormFields>({
    defaultValues: {
      firstName: currentUser?.firstName ?? '',
      lastName: currentUser?.lastName ?? '',
    },
  });

  const { handleSubmit, setApolloGraphQLResponseErrors } = form;

  const [commitUpdateUserMutation, { loading }] = useMutation(authUpdateUserProfileMutation, {
    onCompleted: () => {
      trackEvent('profile', 'personal-data-update');

      toast({
        description: intl.formatMessage({
          defaultMessage: 'Personal data successfully changed.',
          id: 'Auth / Update profile/ Success message',
        }),
      });
    },
    onError: (error) => {
      setApolloGraphQLResponseErrors(error.graphQLErrors);
    },
  });

  const handleUpdate = handleSubmit((input: UpdateProfileFormFields) => {
    commitUpdateUserMutation({
      variables: {
        input,
      },
    });
  });

  return { ...form, loading, handleUpdate };
};
