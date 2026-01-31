import { useMutation } from '@apollo/client/react';
import { getFragmentData } from '@sb/webapp-api-client';
import { commonQueryMembershipFragment, useCommonQuery } from '@sb/webapp-api-client/providers';
import { Button } from '@sb/webapp-core/components/buttons';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast';
import { MailOpen } from 'lucide-react';
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
    defaultMessage: 'Invitation accepted!',
  });

  const declineSuccessMessage = intl.formatMessage({
    id: 'Tenant Invitation / Decline / Success message',
    defaultMessage: 'Invitation declined.',
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
      toast({ description: acceptSuccessMessage, variant: 'success' });
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
      toast({ description: declineSuccessMessage, variant: 'info' });
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MailOpen className="h-5 w-5" />
            <FormattedMessage defaultMessage="Organization Invitation" id="Tenant Invitation / Page headline" />
          </CardTitle>
          <CardDescription>
            <FormattedMessage
              defaultMessage="You've been invited to join an organization"
              id="Tenant Invitation / Card description"
            />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground mb-1">
              <FormattedMessage defaultMessage="Organization" id="Tenant Invitation / Organization label" />
            </p>
            <p className="text-lg font-medium">{tenant.name}</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleAccept} disabled={isLoading}>
              <FormattedMessage defaultMessage="Accept invitation" id="Tenant Invitation / Accept button" />
            </Button>
            <Button variant="outline" onClick={handleDecline} disabled={isLoading}>
              <FormattedMessage defaultMessage="Decline" id="Tenant Invitation / Decline button" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};
