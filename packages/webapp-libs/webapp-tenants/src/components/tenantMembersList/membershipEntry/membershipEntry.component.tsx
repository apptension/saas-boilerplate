import { useMutation } from '@apollo/client';
import { TenantMembershipType, TenantUserRole, getFragmentData } from '@sb/webapp-api-client';
import { commonQueryMembershipFragment } from '@sb/webapp-api-client/providers';
import { Button } from '@sb/webapp-core/components/buttons';
import { ConfirmDialog } from '@sb/webapp-core/components/confirmDialog';
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
} from '@sb/webapp-core/components/ui/dropdown-menu';
import { Skeleton as SkeletonComponent } from '@sb/webapp-core/components/ui/skeleton';
import { TableCell, TableRow } from '@sb/webapp-core/components/ui/table';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { useToast } from '@sb/webapp-core/toast';
import { GripHorizontal, Hourglass, UserCheck } from 'lucide-react';
import { indexBy, prop, trim } from 'ramda';
import { MouseEvent, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { useGenerateTenantPath, useTenantRoles } from '../../../hooks';
import { useCurrentTenant } from '../../../providers';
import { deleteTenantMembershipMutation, updateTenantMembershipMutation } from './membershipEntry.graphql';

export type MembershipEntryProps = {
  className?: string;
  membership: TenantMembershipType;
  onAfterUpdate?: () => void;
};

export const MembershipEntry = ({ membership, className, onAfterUpdate }: MembershipEntryProps) => {
  const { data: currentTenant } = useCurrentTenant();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getRoleTranslation } = useTenantRoles();
  const intl = useIntl();
  const generateTenantPath = useGenerateTenantPath();
  const isCurrentUserMembership =
    getFragmentData(commonQueryMembershipFragment, currentTenant?.membership)?.id === membership?.id;

  const updateSuccessMessage = intl.formatMessage({
    id: 'Membership Entry / UpdateRole / Success message',
    defaultMessage: '🎉 The user role was updated successfully!',
  });

  const updateFailMessage = intl.formatMessage({
    id: 'Membership Entry / UpdateRole / Fail message',
    defaultMessage: 'Unable to change the user role.',
  });

  const deleteSuccessMessage = intl.formatMessage({
    id: 'Membership Entry / DeleteMembership / Success message',
    defaultMessage: '🎉 User was deleted successfully!',
  });

  const deleteFailMessage = intl.formatMessage({
    id: 'Membership Entry / DeleteMembership / Fail message',
    defaultMessage: 'Unable to delete the user.',
  });

  const [commitUpdateMutation, { loading }] = useMutation(updateTenantMembershipMutation, {
    onCompleted: () => {
      toast({ description: updateSuccessMessage });
    },
    onError: () => {
      toast({ description: updateFailMessage, variant: 'destructive' });
    },
  });

  const [commitDeleteMutation] = useMutation(deleteTenantMembershipMutation, {
    onCompleted: () => {
      toast({ description: deleteSuccessMessage });
      onAfterUpdate?.();
    },
    onError: () => {
      toast({ description: deleteFailMessage, variant: 'destructive' });
    },
  });

  const roles = useMemo(() => [TenantUserRole.OWNER, TenantUserRole.ADMIN, TenantUserRole.MEMBER], []);
  const roleChangeCallbacks = useMemo(() => {
    if (!currentTenant) return;

    const mapper = roles.map((role) => ({
      role,
      callback: () => {
        if (role === TenantUserRole.MEMBER && isCurrentUserMembership) {
          navigate(generateTenantPath(RoutesConfig.home, { tenantId: currentTenant?.id || '' }));
        }

        commitUpdateMutation({
          variables: {
            input: { id: membership.id, tenantId: currentTenant.id, role },
          },
        });
      },
    }));

    return indexBy(prop('role'), mapper);
  }, [
    currentTenant,
    roles,
    isCurrentUserMembership,
    membership.id,
    commitUpdateMutation,
    navigate,
    generateTenantPath,
  ]);

  const deleteMembership = () => {
    if (!currentTenant) return;

    commitDeleteMutation({
      variables: {
        input: {
          id: membership.id,
          tenantId: currentTenant.id,
        },
      },
    });
  };

  const name = trim([membership.firstName, membership.lastName].map((s) => trim(s ?? '')).join(' '));
  return (
    <TableRow className={className}>
      <TableCell>{name || membership.userEmail || membership.inviteeEmailAddress}</TableCell>

      <TableCell>
        {loading ? (
          <SkeletonComponent className="h-6 w-12" />
        ) : (
          getRoleTranslation(membership.role?.toUpperCase() as TenantUserRole)
        )}
      </TableCell>
      <TableCell>
        {membership.invitationAccepted ? (
          <div className="flex items-center">
            <UserCheck className="mr-2 w-4 h-4" />
            <FormattedMessage id="Tenant Membersip Entry / Yes" defaultMessage="Yes" />
          </div>
        ) : (
          <div className="flex items-center">
            <Hourglass className="mr-2 w-4 h-4" />
            <FormattedMessage id="Tenant Membersip Entry / Yes" defaultMessage="No" />
          </div>
        )}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" role="button">
              <GripHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <FormattedMessage id="Tenant Membersip Entry / Actions" defaultMessage="Actions" />
            </DropdownMenuLabel>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger role="button">
                <FormattedMessage id="Tenant Membersip Entry / Change role" defaultMessage="Change role" />
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {roles
                    .filter((role) => role !== (membership.role?.toUpperCase() as TenantUserRole))
                    .map((role) => (
                      <DropdownMenuItem role="button" onClick={roleChangeCallbacks?.[role].callback} key={role}>
                        {getRoleTranslation(role)}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <ConfirmDialog
              onContinue={deleteMembership}
              title={
                <FormattedMessage id="Tenant Membersip Entry / Confirm Dialog / Delete Title" defaultMessage="Delete" />
              }
              description={
                <FormattedMessage
                  id="Tenant Membersip Entry / Confirm Dialog / Delete Description"
                  defaultMessage="Are you sure you want to delete this member?"
                />
              }
              variant="destructive"
            >
              <DropdownMenuItem>
                <FormattedMessage id="Tenant Membersip Entry / Delete" defaultMessage="Delete" />
              </DropdownMenuItem>
            </ConfirmDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
