import { TenantType } from '@sb/webapp-api-client/constants';
import { CommonQueryTenantItemFragmentFragment, TenantUserRole, getFragmentData } from '@sb/webapp-api-client/graphql';
import { commonQueryMembershipFragment } from '@sb/webapp-api-client/providers';
import { Button } from '@sb/webapp-core/components/ui/button';
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
import { cn } from '@sb/webapp-core/lib/utils';
import { Building2, ChevronDown, Plus, User, UserPlus } from 'lucide-react';
import { groupBy, head, prop } from 'ramda';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { RoutesConfig as TenantRoutesConfig } from '../../config/routes';
import { useGenerateTenantPath, useTenants } from '../../hooks';
import { useCurrentTenant } from '../../providers';

export type TenantSwitchSidebarProps = {
  collapsed?: boolean;
};

export const TenantSwitchSidebar = ({ collapsed = false }: TenantSwitchSidebarProps = {}) => {
  const { data: currentTenant } = useCurrentTenant();
  const tenants = useTenants();
  const navigate = useNavigate();
  const generateTenantPath = useGenerateTenantPath();
  const generateLocalePath = useGenerateLocalePath();

  const tenantsGrouped = groupBy(prop<string>('type'), tenants);
  const personalTenant = head(tenantsGrouped[TenantType.PERSONAL] ?? []);
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

  const hasPendingInvitations = (organizationTenants?.invitations?.length ?? 0) > 0;

  const triggerButton = collapsed ? (
    <Button variant="ghost" size="icon" className="relative h-9 w-9">
      <Building2 className="h-4 w-4" />
      {hasPendingInvitations && (
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
      )}
    </Button>
  ) : (
    <Button variant="outline" className="relative w-full justify-between overflow-hidden text-left font-normal">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="relative shrink-0">
          <Building2 className="h-4 w-4" />
          {hasPendingInvitations && (
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />
          )}
        </div>
        <span className="truncate">{currentTenant?.name}</span>
      </div>
      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

  const content = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={collapsed ? 'end' : 'start'}
        className={cn(collapsed ? 'w-56' : 'w-[var(--radix-dropdown-menu-trigger-width)]')}
      >
        {/* <DropdownMenuLabel>
          <FormattedMessage defaultMessage="Personal account" id="TenantSwitch / Personal account" />
        </DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={personalTenant?.id === currentTenant?.id}
          onClick={handleTenantChange(personalTenant)}
          className="gap-2"
        >
          <User className="h-4 w-4" />
          {personalTenant?.name}
        </DropdownMenuCheckboxItem> */}
        {organizationTenants?.organizations?.length > 0 && (
          <>
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
            className="gap-2"
          >
            <Building2 className="h-4 w-4" />
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
          <DropdownMenuItem key={invitation?.id} onClick={handleInvitationClick(invitation)} className="gap-2">
            <div className="relative">
              <UserPlus className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />
            </div>
            {invitation?.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleNewTenantClick} className="gap-2">
          <Plus className="h-4 w-4" />
          <FormattedMessage defaultMessage="Create new organization" id="TenantSwitch / Create new organization" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">
          <div className="flex flex-col">
            <span className="font-medium">{currentTenant?.name}</span>
            <FormattedMessage defaultMessage="Switch tenant" id="Sidebar / Switch tenant" />
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
};
