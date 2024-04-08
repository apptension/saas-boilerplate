import { TenantMembershipType, TenantUserRole } from '@sb/webapp-api-client';
import { Button } from '@sb/webapp-core/components/buttons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@sb/webapp-core/components/dropdownMenu';
import { TableCell, TableRow } from '@sb/webapp-core/components/table';
import { GripHorizontal, Hourglass, UserCheck } from 'lucide-react';
import { indexBy, prop, trim } from 'ramda';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import { useMutation } from '@apollo/client';
import { useTenantRoles } from '../../../hooks/useTenantRoles';
import { updateTenantMembershipMutation } from './membershipEntry.graphql';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';

export type MembershipEntryProps = {
  className?: string;
  membership: TenantMembershipType;
};

export const MembershipEntry = ({
  membership,
  className,
}: MembershipEntryProps) => {
  const { data: currentTenant } = useCurrentTenant();
  const { getRoleTranslation } = useTenantRoles();
  const [commitUpdateMutation] = useMutation(updateTenantMembershipMutation);

  const roles = [
    TenantUserRole.OWNER,
    TenantUserRole.ADMIN,
    TenantUserRole.MEMBER,
  ];
  const roleChangeCallbacks = useMemo(() => {
    if (!currentTenant) return;

    const mapper = roles.map((role) => ({
      role,
      callback: () =>
        commitUpdateMutation({
          variables: {
            input: { id: membership.id, tenantId: currentTenant.id, role },
          },
        }),
    }));

    return indexBy(prop('role'), mapper);
  }, [roles, membership.id]);

  const name = trim(
    [membership.firstName, membership.lastName]
      .map((s) => trim(s ?? ''))
      .join(' '),
  );
  return (
    <TableRow className={className}>
      <TableCell>
        {name || membership.userEmail || membership.inviteeEmailAddress}
      </TableCell>
      <TableCell>
        {getRoleTranslation(membership.role?.toUpperCase() as TenantUserRole)}
      </TableCell>
      <TableCell>
        {membership.invitationAccepted ? (
          <div className="flex items-center">
            <UserCheck className="mr-2 w-4 h-4" />
            <FormattedMessage
              id="Tenant Membersip Entry / Yes"
              defaultMessage="Yes"
            />
          </div>
        ) : (
          <div className="flex items-center">
            <Hourglass className="mr-2 w-4 h-4" />
            <FormattedMessage
              id="Tenant Membersip Entry / Yes"
              defaultMessage="No"
            />
          </div>
        )}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <GripHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <FormattedMessage
                id="Tenant Membersip Entry / Actions"
                defaultMessage="Actions"
              />
            </DropdownMenuLabel>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <FormattedMessage
                  id="Tenant Membersip Entry / Change role"
                  defaultMessage="Change role"
                />
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {roles
                    .filter((role) => role !== (membership.role?.toUpperCase() as TenantUserRole))
                    .map((role) => (
                      <DropdownMenuItem
                        onClick={roleChangeCallbacks[role].callback}
                        key={role}
                      >
                        {getRoleTranslation(role)}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuItem>
              <FormattedMessage
                id="Tenant Membersip Entry / Delete"
                defaultMessage="Delete"
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
