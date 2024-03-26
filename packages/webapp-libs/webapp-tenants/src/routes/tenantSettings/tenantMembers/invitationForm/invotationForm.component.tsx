import { useMutation } from '@apollo/client';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast';
import { useIntl } from 'react-intl';

import { TenantInvitationForm, type TenantInvitationFormFields } from '../../../../components/tenantInvitationForm';
import { tenantMembersListQuery } from '../../../../components/tenantMembersList/tenantMembersList.graphql';
import { useCurrentTenant } from '../../../../providers';
import { createTenantInvitation } from './invitationForm.graphql';

export const InvitationForm = () => {
  const { toast } = useToast();
  const intl = useIntl();
  const currentTenant = useCurrentTenant();

  const successMessage = intl.formatMessage({
    id: 'Tenant Members / Invitation form / Success message',
    defaultMessage: '🎉 User invited successfully!',
  });

  const [commitTenantInvitationMutation, { error, loading: loadingMutation }] = useMutation(createTenantInvitation, {
    refetchQueries: () => [
      {
        query: tenantMembersListQuery,
        variables: {
          id: currentTenant.data!.id,
        },
      },
    ],
    onCompleted: () => {
      trackEvent('tenantInvitation', 'invite', currentTenant.data?.id);
      toast({ description: successMessage });
    },
  });

  const onInvitationFormSubmit = async (formData: TenantInvitationFormFields) => {
    await commitTenantInvitationMutation({
      variables: {
        input: {
          email: formData.email,
          role: formData.role,
          tenantId: currentTenant.data!.id,
        },
      },
    });
  };

  return <TenantInvitationForm onSubmit={onInvitationFormSubmit} loading={loadingMutation} error={error} />;
};
