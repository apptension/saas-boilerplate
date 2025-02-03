import { TenantType } from '@sb/webapp-api-client/constants';
import { CommonQueryTenantItemFragmentFragment, TenantUserRole, getFragmentData } from '@sb/webapp-api-client/graphql';
import { commonQueryMembershipFragment } from '@sb/webapp-api-client/providers';
import { Button } from '@sb/webapp-core/components/buttons';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@sb/webapp-core/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@sb/webapp-core/components/ui/tooltip';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { ChevronDown, Plus, Settings, UserPlus } from 'lucide-react';
import { groupBy, head, prop } from 'ramda';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { RoutesConfig as TenantRoutesConfig } from '../../config/routes';
import { useGenerateTenantPath, useTenantRoleAccessCheck, useTenants } from '../../hooks';
import { useCurrentTenant } from '../../providers';

export const TenantSwitch = () => {
  const { data: currentTenant } = useCurrentTenant();
  const tenants = useTenants();
  const navigate = useNavigate();
  const generateTenantPath = useGenerateTenantPath();
  const generateLocalePath = useGenerateLocalePath();
  const { isAllowed: hasAccessToTenantSettings } = useTenantRoleAccessCheck([
    TenantUserRole.OWNER,
    TenantUserRole.ADMIN,
  ]);

  const tenantsGrouped = groupBy(prop<string>('type'), tenants);
  const personalTenant = head(tenantsGrouped[TenantType.PERSONAL]);
  const organizationTenants = groupBy(
    (tenant) =>
      getFragmentData(commonQueryMembershipFragment, tenant?.membership)?.invitationAccepted
        ? 'organizations'
        : 'invitations',
    tenantsGrouped[TenantType.ORGANIZATION] ?? []
  );

  const handleTenantChange = (tenant?: CommonQueryTenantItemFragmentFragment | null) => () => {
    if (!tenant) return;
    navigate(generateTenantPath(RoutesConfig.home, { tenantId: tenant.id }));
  };

  const handleInvitationClick = (tenant?: CommonQueryTenantItemFragmentFragment | null) => () => {
    const token = getFragmentData(commonQueryMembershipFragment, tenant?.membership)?.invitationToken;
    if (!token) return;
    navigate(generateLocalePath(RoutesConfig.tenantInvitation, { token }));
  };

  const handleNewTenantClick = () => {
    navigate(generateLocalePath(RoutesConfig.addTenant));
  };

  const handleTenantSettingsClick = () => {
    navigate(generateTenantPath(TenantRoutesConfig.tenant.settings.members));
  };

  const handleLastInvitationClick = () => {
    handleInvitationClick(organizationTenants?.invitations?.[0])();
  };

  const renderPendingInvitationBadge = () => {
    return (
      <Button data-testid="tenant-invitation-pending-btn" color="primary" size="sm" onClick={handleLastInvitationClick}>
        <UserPlus className="mr-2" size="16" />
        <FormattedMessage
          defaultMessage="{invitationsCount, plural, =1 {# invitation} other {# invitations}}"
          id="TenantSwitch / Invitations Badge"
          values={{ invitationsCount: organizationTenants?.invitations?.length ?? 0 }}
        />
      </Button>
    );
  };

  const renderTenantSettings = () => (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={handleTenantSettingsClick} data-testid="tenant-settings-btn">
          <Settings size="20" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <FormattedMessage defaultMessage="Organization settings" id="TenantSwitch / Organization settings" />
      </TooltipContent>
    </Tooltip>
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="overflow-hidden">
            <div className="overflow-ellipsis overflow-hidden whitespace-nowrap max-w-full">{currentTenant?.name}</div>
            <ChevronDown className="ml-2 mr--2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>
            <FormattedMessage defaultMessage="Personal account" id="TenantSwitch / Personal account" />
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={personalTenant?.id === currentTenant?.id}
            onClick={handleTenantChange(personalTenant)}
          >
            {personalTenant?.name}
          </DropdownMenuCheckboxItem>
          {organizationTenants?.organizations?.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>
                <FormattedMessage defaultMessage="Organizations" id="TenantSwitch / Organizations" />
              </DropdownMenuLabel>
            </>
          )}
          {organizationTenants?.organizations?.map((tenant) => (
            <DropdownMenuCheckboxItem
              checked={tenant?.id === currentTenant?.id}
              key={tenant?.id}
              onClick={handleTenantChange(tenant)}
            >
              {tenant?.name}
            </DropdownMenuCheckboxItem>
          ))}
          {organizationTenants?.invitations?.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>
                <FormattedMessage defaultMessage="Invitations" id="TenantSwitch / Invitations" />
              </DropdownMenuLabel>
            </>
          )}
          {organizationTenants?.invitations?.map((invitation) => (
            <DropdownMenuItem key={invitation?.id} onClick={handleInvitationClick(invitation)}>
              <UserPlus className="mr-2" size="16" /> {invitation?.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleNewTenantClick}>
            <Plus className="mr-1" size="16" />{' '}
            <FormattedMessage defaultMessage="Create new organization" id="TenantSwitch / Create new organization" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {hasAccessToTenantSettings && renderTenantSettings()}
      {organizationTenants?.invitations?.length > 0 && renderPendingInvitationBadge()}
    </>
  );
};
