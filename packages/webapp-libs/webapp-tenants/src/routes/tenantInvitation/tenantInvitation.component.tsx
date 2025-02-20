import { useMutation } from '@apollo/client';
import { getFragmentData } from '@sb/webapp-api-client';
import { commonQueryMembershipFragment, useCommonQuery } from '@sb/webapp-api-client/providers';
import { Button } from '@sb/webapp-core/components/buttons';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast';
import { useCallback, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';

import { useGenerateTenantPath, useTenants } from '../../hooks';
import { acceptTenantInvitationMutation, declineTenantInvitationMutation } from './tenantInvitation.graphql';

export type InvitationPathParams = {
  token: string;
};

export const TenantInvitation = () => {
  const params = useParams<InvitationPathParams>();
  const { reload: reloadCommonQuery } = useCommonQuery();
  const tenants = useTenants();
  const navigate = useNavigate();
  const generateTenantPath = useGenerateTenantPath();
  const generateLocalePath = useGenerateLocalePath();
  const { toast } = useToast();
  const intl = useIntl();
  const { token } = params;

  const acceptSuccessMessage = intl.formatMessage({
    id: 'Tenant Invitation / Accept / Success message',
    defaultMessage: '🎉 Invitation accepted!',
  });

  const declineSuccessMessage = intl.formatMessage({
    id: 'Tenant Invitation / Decline / Success message',
    defaultMessage: '🎉 Invitation declined!',
  });

  const tenant = tenants.find(
    (t) => getFragmentData(commonQueryMembershipFragment, t?.membership)?.invitationToken === token
  );
  const tenantMembership = getFragmentData(commonQueryMembershipFragment, tenant?.membership);
  const tenantMembershipId = tenantMembership?.id || '';

  const [commitAcceptMutation, { loading: acceptLoading }] = useMutation(acceptTenantInvitationMutation, {
    onCompleted: () => {
      reloadCommonQuery();
      trackEvent('tenantInvitation', 'accept', tenant?.id);
      toast({ description: acceptSuccessMessage });
      if (tenant) navigate(generateTenantPath(RoutesConfig.home, { tenantId: tenant?.id }));
    },
  });

  const handleAccept = useCallback(() => {
    if (!token || !tenant) return;
    commitAcceptMutation({
      variables: {
        input: {
          token,
          id: tenantMembershipId,
        },
      },
    });
  }, [token]);

  const [commitDeclineMutation, { loading: declineLoading }] = useMutation(declineTenantInvitationMutation, {
    onCompleted: () => {
      reloadCommonQuery();
      trackEvent('tenantInvitation', 'decline', tenant?.id);
      toast({ description: declineSuccessMessage });
      navigate(generateLocalePath(RoutesConfig.home));
    },
  });

  const handleDecline = useCallback(() => {
    if (!token || !tenant) return;
    commitDeclineMutation({
      variables: {
        input: {
          token,
          id: tenantMembershipId,
        },
      },
    });
  }, [token]);

  let redirectPath: string | null = null;

  if (!tenant) {
    redirectPath = generateLocalePath(RoutesConfig.home);
  } else if (tenantMembership?.invitationAccepted) {
    redirectPath = generateTenantPath(RoutesConfig.home, { tenantId: tenant.id });
  }

  useEffect(() => {
    if (redirectPath) {
      navigate(redirectPath);
    }
  }, [redirectPath]);

  if (!tenant || redirectPath) {
    return null;
  }

  const isLoading = acceptLoading || declineLoading;

  return (
    <PageLayout>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>
            <FormattedMessage defaultMessage="Invitation" id="Tenant Invitation / Page headline" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <FormattedMessage
              defaultMessage="You are invited to join the organization: {organizationName}"
              id="Tenant Invitation / Invitation message"
              values={{ organizationName: tenant.name }}
            />
          </div>
          <div className="flex justify-start gap-2 mt-4">
            <Button color="primary" onClick={handleAccept} disabled={isLoading}>
              <FormattedMessage defaultMessage="Accept" id="Tenant Invitation / Accept button" />
            </Button>
            <Button variant="secondary" onClick={handleDecline} disabled={isLoading}>
              <FormattedMessage defaultMessage="Decline" id="Tenant Invitation / Decline button" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};
