import { useMutation } from '@apollo/client/react';
import { extractGraphQLErrors } from '@sb/webapp-api-client/api';
import { useApiForm } from '@sb/webapp-api-client/hooks';
import { DEFAULT_LOCALE } from '@sb/webapp-core/config/i18n';
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
      language: currentUser?.language ?? DEFAULT_LOCALE,
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
        variant: 'success',
      });
    },
    onError: (error) => {
      const graphQLErrors = extractGraphQLErrors(error);
      if (graphQLErrors) {
        setApolloGraphQLResponseErrors(graphQLErrors);
      }
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
