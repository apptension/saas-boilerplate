import { TenantType } from '@sb/webapp-api-client/constants';
import { TenantListItemFragmentFragment } from '@sb/webapp-api-client/graphql';
import { Button } from '@sb/webapp-core/components/buttons';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@sb/webapp-core/components/dropdownMenu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@sb/webapp-core/components/tooltip';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { ChevronDown, Plus, Settings } from 'lucide-react';
import { groupBy, head, prop } from 'ramda';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { useGenerateTenantPath } from '../../hooks';
import { useTenants } from '../../hooks/useTenants/useTenants.hook';
import { useCurrentTenant } from '../../providers';

export const TenantSwitch = () => {
  const { data: currentTenant } = useCurrentTenant();
  const tenants = useTenants();
  const navigate = useNavigate();
  const generateTenantPath = useGenerateTenantPath();

  const tenantsGrouped = groupBy(prop<string>('type'), tenants);
  const personalTenant = head(tenantsGrouped[TenantType.PERSONAL]);
  const organizationTenants = tenantsGrouped[TenantType.ORGANIZATION] ?? [];

  const handleTenantChange = (tenant?: TenantListItemFragmentFragment | null) => () => {
    if (!tenant) return;
    navigate(generateTenantPath(RoutesConfig.home, { tenantId: tenant.id }));
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            {currentTenant?.name} <ChevronDown className="ml-2 mr--2" />
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
          {organizationTenants.length && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>
                <FormattedMessage defaultMessage="Organizations" id="TenantSwitch / Organizations" />
              </DropdownMenuLabel>
            </>
          )}
          {organizationTenants.map((tenant) => (
            <DropdownMenuCheckboxItem
              checked={tenant?.id === currentTenant?.id}
              key={tenant?.id}
              onClick={handleTenantChange(tenant)}
            >
              {tenant?.name}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Plus className="mr-1" size="16" />{' '}
            <FormattedMessage defaultMessage="Create new tenant" id="TenantSwitch / Create new tenant" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings size="20" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <FormattedMessage defaultMessage="Organization settings" id="TenantSwitch / Organization settings" />
        </TooltipContent>
      </Tooltip>
    </>
  );
};
